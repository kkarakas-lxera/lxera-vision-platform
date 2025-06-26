
import React, { useState } from 'react';
import { Upload, FileText, X, Loader2, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { verifyAuthSession, debugAuthState, ensureAuthenticatedClient } from '@/lib/auth-helpers';
import { uploadCVViaEdgeFunction } from '@/lib/cv-upload-service';

interface CVUploadDialogProps {
  employee: {
    id: string;
    name: string;
    email: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete?: () => void;
}

export function CVUploadDialog({ 
  employee, 
  open, 
  onOpenChange,
  onUploadComplete 
}: CVUploadDialogProps) {
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = ['application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
        'text/plain'];
      
      if (!validTypes.includes(selectedFile.type)) {
        setError('Please upload a PDF, DOC, DOCX, or TXT file');
        return;
      }
      
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB');
        return;
      }
      
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    if (!userProfile?.company_id) {
      setError('Company information not found. Please try logging in again.');
      return;
    }

    // Security validation: Check user permissions
    if (userProfile.role !== 'company_admin' && userProfile.role !== 'super_admin') {
      setError('You do not have permission to upload CVs.');
      return;
    }

    setUploading(true);
    setError(null);
    setProgress(10);

    try {
      // Debug current auth state
      console.log('🔐 Starting CV upload, checking auth state...');
      await debugAuthState();
      
      // Verify we have a valid session before proceeding
      const session = await verifyAuthSession();
      if (!session) {
        throw new Error('No active authentication session. Please sign in again.');
      }
      
      console.log('✅ Auth session verified:', {
        userId: session.user.id,
        email: session.user.email,
        expiresAt: new Date(session.expires_at! * 1000).toISOString()
      });
      
      // Ensure the client is properly authenticated
      await ensureAuthenticatedClient();
      setProgress(15);

      // Verify employee belongs to user's company
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('company_id')
        .eq('id', employee.id)
        .single();

      if (employeeError) {
        throw new Error('Employee not found');
      }

      if (employeeData.company_id !== userProfile.company_id) {
        throw new Error('You can only upload CVs for employees in your company');
      }

      setProgress(30);

      // Try multiple file path formats to find one that works
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      
      // Format 1: company_id/filename (most permissive)
      const filePath = `${userProfile.company_id}/cv-${employee.id}-${timestamp}.${fileExtension}`;
      
      // Final auth check before upload
      const { data: authCheck } = await supabase.rpc('check_auth_uid');
      console.log('📊 Database auth check:', authCheck);
      
      console.log('CV Upload attempt:', { 
        filePath, 
        employeeName: employee.name, 
        userRole: userProfile.role,
        companyId: userProfile.company_id,
        bucketId: 'employee-cvs',
        hasAuthSession: !!session,
        authUid: authCheck?.auth_uid
      });
      
      // Try uploading with proper auth headers
      console.log('🚀 Attempting storage upload...');
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('employee-cvs')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('❌ Storage upload error:', uploadError);
        
        // Check if it's an auth issue
        if (uploadError.message?.includes('permission') || uploadError.message?.includes('policy')) {
          // Try refreshing session and retrying once
          console.log('🔄 Auth error detected, refreshing session...');
          const { data: { session: newSession } } = await supabase.auth.refreshSession();
          
          if (newSession) {
            console.log('✅ Session refreshed, retrying upload...');
            await debugAuthState();
          }
        }
        
        // Try alternative path format if first one fails
        const altFilePath = `${userProfile.company_id}/${employee.id}/${timestamp}.${fileExtension}`;
        console.log('Trying alternative path:', altFilePath);
        
        const { data: altUploadData, error: altUploadError } = await supabase.storage
          .from('employee-cvs')
          .upload(altFilePath, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (altUploadError) {
          console.error('Alternative upload also failed:', altUploadError);
          
          // Try edge function as last resort
          console.log('🔄 Trying edge function upload...');
          const edgeResult = await uploadCVViaEdgeFunction(
            file, 
            employee.id,
            (progress) => setProgress(30 + (progress * 0.3))
          );
          
          if (!edgeResult.success) {
            throw new Error(edgeResult.error || 'All upload methods failed');
          }
          
          console.log('✅ Edge function upload successful');
          setProgress(60);
          
          // Skip the employee update since edge function handles it
          setProgress(80);
          setUploading(false);
          setAnalyzing(true);
          
          // Edge function already triggers analysis, so just complete
          setProgress(100);
          
          toast({
            title: 'Success',
            description: 'CV uploaded successfully',
          });

          setTimeout(() => {
            onOpenChange(false);
            if (onUploadComplete) onUploadComplete();
          }, 1000);
          
          return; // Exit early since edge function handled everything
        }
        
        console.log('Alternative upload successful');
      }
      
      const finalPath = uploadData?.path || filePath;
      console.log('Upload successful, file path:', finalPath);
      setProgress(60);

      // Step 2: Save file path to employee record
      const { error: updateError } = await supabase
        .from('employees')
        .update({ cv_file_path: finalPath })
        .eq('id', employee.id);

      if (updateError) {
        console.error('Employee update error:', updateError);
        throw updateError;
      }
      
      setProgress(80);
      setUploading(false);
      setAnalyzing(true);

      // Step 3: Trigger CV analysis via Edge Function
      try {
        const { data, error: analysisError } = await supabase.functions.invoke('analyze-cv', {
          body: { 
            employee_id: employee.id,
            file_path: finalPath 
          }
        });

        if (analysisError) {
          console.error('Analysis error:', analysisError);
          // Don't throw here - upload was successful, analysis can be retried
          console.warn('CV analysis failed, but upload was successful');
        }
      } catch (analysisError) {
        console.warn('CV analysis request failed:', analysisError);
      }

      setProgress(100);
      
      toast({
        title: 'Success',
        description: 'CV uploaded successfully',
      });

      // Close dialog and refresh
      setTimeout(() => {
        onOpenChange(false);
        if (onUploadComplete) onUploadComplete();
      }, 1000);

    } catch (error) {
      console.error('Upload error:', error);
      let errorMessage = 'Upload failed';
      
      if (error instanceof Error) {
        if (error.message.includes('permission') || error.message.includes('policy')) {
          errorMessage = 'Permission denied. Please check your role and company access.';
        } else if (error.message.includes('bucket')) {
          errorMessage = 'Storage configuration error. Please contact support.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
    setProgress(0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload CV for {employee.name}</DialogTitle>
          <DialogDescription>
            Upload a CV document to analyze skills and calculate gaps
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!file && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                id="cv-upload"
                className="hidden"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileSelect}
                disabled={uploading || analyzing}
              />
              <label
                htmlFor="cv-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="h-12 w-12 text-gray-400 mb-3" />
                <span className="text-sm font-medium">Click to upload CV</span>
                <span className="text-xs text-gray-500 mt-1">
                  PDF, DOC, DOCX, or TXT (max 10MB)
                </span>
              </label>
            </div>
          )}

          {file && (
            <div className="border rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              {!uploading && !analyzing && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={removeFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {(uploading || analyzing) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{analyzing ? 'Analyzing CV...' : 'Uploading...'}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
              {analyzing && (
                <p className="text-xs text-gray-500 text-center">
                  Using AI to extract skills and calculate gaps...
                </p>
              )}
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {progress === 100 && (
            <div className="flex items-center justify-center text-green-600">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">Upload complete!</span>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={uploading || analyzing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || uploading || analyzing}
            >
              {uploading || analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {analyzing ? 'Analyzing...' : 'Uploading...'}
                </>
              ) : (
                'Upload & Analyze'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
