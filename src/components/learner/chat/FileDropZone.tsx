import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileDropZoneProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

export default function FileDropZone({ onFileSelect, isLoading }: FileDropZoneProps) {
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const validFile = files.find(file => 
      file.type === 'application/pdf' || 
      file.type === 'application/msword' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    
    if (validFile) {
      onFileSelect(validFile);
    }
  }, [onFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 mb-4"
    >
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-8 text-center transition-all",
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50",
          isLoading && "opacity-50 pointer-events-none"
        )}
      >
        <input
          type="file"
          id="cv-upload"
          className="hidden"
          accept=".pdf,.doc,.docx"
          onChange={handleFileInput}
          disabled={isLoading}
        />
        
        <label htmlFor="cv-upload" className="cursor-pointer">
          <div className="flex flex-col items-center gap-3">
            {isDragging ? (
              <FileText className="h-12 w-12 text-blue-500" />
            ) : (
              <Upload className="h-12 w-12 text-gray-400" />
            )}
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">
                {isDragging ? "Drop your CV here!" : "Drop your CV here or click to browse"}
              </p>
              <p className="text-xs text-gray-500">
                Supports PDF, DOC, DOCX (Max 10MB)
              </p>
            </div>
          </div>
        </label>
      </div>
    </motion.div>
  );
}