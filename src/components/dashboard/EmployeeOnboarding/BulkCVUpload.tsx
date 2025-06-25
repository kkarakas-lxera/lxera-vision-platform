
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface UploadedFile {
  file: File;
  employeeName: string;
  employeeId?: string;
  status: 'pending' | 'uploading' | 'analyzing' | 'complete' | 'error';
  progress: number;
  error?: string;
}

interface BulkCVUploadProps {
  onUploadComplete?: () => void;
}

export function BulkCVUpload({ onUploadComplete }: BulkCVUploadProps) {
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const extractEmployeeName = (filename: string): string => {
    // Remove extension and clean up common patterns
    const nameWithoutExt = filename.replace(/\.(pdf|docx?|txt)$/i, '');
    const cleanName = nameWithoutExt
      .replace(/[-_]?(cv|resume|CV|Resume)[-_]?/gi, '')
      .replace(/[-_]/g, ' ')
      .trim();
    
    // Capitalize each word
    return cleanName.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      file,
      employeeName: extractEmployeeName(file.name),
      status: 'pending' as const,
      progress: 0
    }));

    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    disabled: isProcessing
  });

  const processFiles = async () => {
    if (!userProfile?.company_id) {
      toast({
        title: 'Error',
        description: 'Company information not found. Please try logging in again.',
        variant: 'destructive'
      });
      return;
    }
    
    // Security validation: Check user permissions
    if (userProfile.role !== 'company_admin' && userProfile.role !== 'super_admin') {
      toast({
        title: 'Error',
        description: 'You do not have permission to upload CVs.',
        variant: 'destructive'
      });
      return;
    }
    
    if (files.length === 0) {
      toast({
        title: 'Error',
        description: 'No files selected for upload.',
        variant: 'destructive'
      });
      return;
    }
    
    setIsProcessing(true);

    // First, get all employees for matching
    const { data: employees } = await supabase
      .from('employees')
      .select('id, users!inner(full_name)')
      .eq('company_id', userProfile.company_id);

    const employeeMap = new Map(
      employees?.map(emp => [
        emp.users.full_name.toLowerCase(),
        emp.id
      ]) || []
    );

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const fileInfo = files[i];
      
      // Match employee by name
      const employeeId = employeeMap.get(fileInfo.employeeName.toLowerCase());
      
      if (!employeeId) {
        setFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'error', error: 'Employee not found' } : f
        ));
        continue;
      }

      try {
        // Update status
        setFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'uploading', progress: 20, employeeId } : f
        ));

        // Upload file with proper file path structure
        const fileName = `cv-${employeeId}-${Date.now()}.${fileInfo.file.name.split('.').pop()}`;
        const filePath = `${userProfile.company_id}/cvs/${employeeId}/${fileName}`;
        
        console.log('Bulk uploading CV:', { 
          filePath, 
          employeeName: fileInfo.employeeName, 
          userRole: userProfile.role,
          companyId: userProfile.company_id
        });
        
        const { error: uploadError } = await supabase.storage
          .from('employee-cvs')
          .upload(filePath, fileInfo.file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Bulk storage upload error:', uploadError);
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        setFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, progress: 50 } : f
        ));

        // Update employee record
        const { error: updateError } = await supabase
          .from('employees')
          .update({ cv_file_path: filePath })
          .eq('id', employeeId);

        if (updateError) {
          console.error('Employee update error:', updateError);
          throw updateError;
        }

        setFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'analyzing', progress: 70 } : f
        ));

        // Trigger analysis
        const { error: analysisError } = await supabase.functions.invoke('analyze-cv', {
          body: { 
            employee_id: employeeId,
            file_path: filePath
          }
        });

        if (analysisError) {
          console.error('Analysis error:', analysisError);
          throw analysisError;
        }

        setFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'complete', progress: 100 } : f
        ));

      } catch (error) {
        console.error(`Error processing ${fileInfo.employeeName}:`, error);
        
        let errorMessage = 'Processing failed';
        if (error instanceof Error) {
          if (error.message.includes('permission') || error.message.includes('policy')) {
            errorMessage = 'Permission denied';
          } else if (error.message.includes('bucket')) {
            errorMessage = 'Storage error';
          } else {
            errorMessage = error.message;
          }
        }
        
        setFiles(prev => prev.map((f, idx) => 
          idx === i ? { 
            ...f, 
            status: 'error', 
            error: errorMessage
          } : f
        ));
      }
    }

    setIsProcessing(false);
    
    const successCount = files.filter(f => f.status === 'complete').length;
    if (successCount > 0) {
      toast({
        title: 'Upload Complete',
        description: `Successfully processed ${successCount} CV(s)`,
      });
      
      if (onUploadComplete) {
        setTimeout(onUploadComplete, 1000);
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setFiles([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk CV Upload</CardTitle>
        <CardDescription>
          Upload multiple CVs at once. Files should be named with employee names (e.g., "John_Doe_CV.pdf")
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop Zone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-sm font-medium mb-1">
            {isDragActive ? 'Drop CVs here' : 'Drag & drop CV files here'}
          </p>
          <p className="text-xs text-muted-foreground">
            or click to select files (PDF, DOC, DOCX, TXT)
          </p>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">
                {files.length} file(s) selected
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                disabled={isProcessing}
              >
                Clear All
              </Button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Employee: {file.employeeName}
                        {file.employeeId && ' ✓'}
                      </p>
                      {file.status !== 'pending' && (
                        <Progress value={file.progress} className="mt-1 h-1" />
                      )}
                      {file.error && (
                        <p className="text-xs text-red-600 mt-1">{file.error}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {file.status === 'pending' && !isProcessing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    {file.status === 'uploading' && (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    )}
                    {file.status === 'analyzing' && (
                      <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                    )}
                    {file.status === 'complete' && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    {file.status === 'error' && (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={processFiles}
              disabled={isProcessing || files.length === 0}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing CVs...
                </>
              ) : (
                `Upload & Analyze ${files.length} CV(s)`
              )}
            </Button>
          </>
        )}

        {/* Instructions */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Naming Convention:</strong> Name files with employee names for automatic matching.
            <br />
            Examples: "John_Doe_CV.pdf", "jane-smith-resume.docx", "Bob_Johnson.pdf"
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
