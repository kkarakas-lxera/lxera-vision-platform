
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { uploadFile } from '@/lib/storage';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileText, X, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CVUploadProps {
  onUploadComplete?: (results: any[]) => void;
  maxFiles?: number;
}

interface UploadedFile {
  file: File;
  id: string;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  progress: number;
  result?: any;
  error?: string;
}

export function CVUpload({ onUploadComplete, maxFiles = 10 }: CVUploadProps) {
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'uploading' as const,
      progress: 0
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setIsProcessing(true);

    // Process each file
    for (const uploadedFile of newFiles) {
      try {
        // Update progress
        setUploadedFiles(prev => 
          prev.map(f => f.id === uploadedFile.id ? { ...f, progress: 25 } : f)
        );

        // Upload to Supabase Storage
        const fileName = `cv-${Date.now()}-${uploadedFile.file.name}`;
        const filePath = `cvs/${fileName}`;
        
        // Get company ID from user profile
        const { data: { user } } = await supabase.auth.getUser();
        const { data: userProfile } = await supabase
          .from('users')
          .select('company_id')
          .eq('id', user?.id)
          .single();

        if (!userProfile?.company_id) throw new Error('Company ID not found');

        // Use simplified upload for now
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, uploadedFile.file);

        if (uploadError) throw uploadError;

        // Update progress
        setUploadedFiles(prev => 
          prev.map(f => f.id === uploadedFile.id ? { ...f, progress: 50, status: 'processing' } : f)
        );

        // Process CV with Supabase Edge Function
        const { data, error } = await supabase.functions.invoke('cv-process', {
          body: { filePath }
        });

        if (error) throw error;

        // Update as complete
        setUploadedFiles(prev => 
          prev.map(f => f.id === uploadedFile.id ? { 
            ...f, 
            progress: 100, 
            status: 'complete',
            result: data 
          } : f)
        );

      } catch (error) {
        console.error('Error processing CV:', error);
        setUploadedFiles(prev => 
          prev.map(f => f.id === uploadedFile.id ? { 
            ...f, 
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          } : f)
        );
      }
    }

    setIsProcessing(false);

    // Notify parent component
    const results = uploadedFiles
      .filter(f => f.status === 'complete')
      .map(f => f.result);
    
    if (results.length > 0 && onUploadComplete) {
      onUploadComplete(results);
    }
  }, [uploadedFiles, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles,
    disabled: isProcessing
  });

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />;
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <Card className={`border-2 border-dashed transition-colors ${
        isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
      }`}>
        <CardContent className="p-8">
          <div
            {...getRootProps()}
            className="text-center cursor-pointer"
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {isDragActive ? 'Drop CVs here' : 'Upload CVs'}
            </h3>
            <p className="text-muted-foreground mb-4">
              Drag and drop CV files here, or click to select files
            </p>
            <Button variant="outline" size="sm">
              Select Files
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Supports PDF, DOC, and DOCX files (max {maxFiles} files)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3">Uploaded Files</h4>
            <div className="space-y-3">
              {uploadedFiles.map((uploadedFile) => (
                <div
                  key={uploadedFile.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{uploadedFile.file.name}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {getStatusIcon(uploadedFile.status)}
                        <span className="text-xs text-muted-foreground capitalize">
                          {uploadedFile.status}
                        </span>
                      </div>
                      {(uploadedFile.status === 'uploading' || uploadedFile.status === 'processing') && (
                        <Progress value={uploadedFile.progress} className="mt-2" />
                      )}
                      {uploadedFile.error && (
                        <Alert className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            {uploadedFile.error}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(uploadedFile.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
