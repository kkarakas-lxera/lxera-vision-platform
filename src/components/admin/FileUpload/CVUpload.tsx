import React, { useState } from 'react';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { uploadFile, STORAGE_BUCKETS, validateFile } from '@/lib/storage';
import { FileUploadResult } from '@/types/storage';

interface CVUploadProps {
  employeeId: string;
  companyId: string;
  onUploadComplete?: (result: FileUploadResult) => void;
}

export function CVUpload({ employeeId, companyId, onUploadComplete }: CVUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<FileUploadResult | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file
    const validation = validateFile(selectedFile, STORAGE_BUCKETS.EMPLOYEE_CVS);
    if (!validation.valid) {
      toast({
        title: 'Invalid file',
        description: validation.error,
        variant: 'destructive',
      });
      return;
    }

    setFile(selectedFile);
    setUploadResult(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress (in real implementation, use XMLHttpRequest for progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await uploadFile(
        file,
        STORAGE_BUCKETS.EMPLOYEE_CVS,
        companyId,
        employeeId,
        'employee'
      );

      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadResult(result);

      if (result.success) {
        toast({
          title: 'Upload successful',
          description: 'CV has been uploaded successfully',
        });
        onUploadComplete?.(result);
      } else {
        toast({
          title: 'Upload failed',
          description: result.error || 'An error occurred during upload',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Upload error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setUploadResult(null);
    setUploadProgress(0);
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Upload CV/Resume</h3>
          {uploadResult?.success && (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
        </div>

        {!file ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
            <div className="flex flex-col items-center space-y-4">
              <Upload className="h-12 w-12 text-gray-400" />
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Drag and drop your CV here, or click to browse
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PDF or DOCX format, max 10MB
                </p>
              </div>
              <label htmlFor="cv-upload" className="cursor-pointer">
                <input
                  id="cv-upload"
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button variant="outline" size="sm" as="span">
                  Select File
                </Button>
              </label>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              {!uploading && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {uploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            {!uploading && !uploadResult && (
              <Button
                onClick={handleUpload}
                className="w-full"
              >
                Upload CV
              </Button>
            )}

            {uploadResult?.success && (
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">
                  CV uploaded successfully!
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Path: {uploadResult.filePath}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}