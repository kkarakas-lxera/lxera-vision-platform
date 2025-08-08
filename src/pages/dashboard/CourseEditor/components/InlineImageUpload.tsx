import React, { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { 
  ImagePlus, 
  Upload, 
  X, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface InlineImageUploadProps {
  show: boolean;
  onClose: () => void;
  onImageInsert: (imageMarkdown: string) => void;
  planId: string;
  moduleId: string;
}

const InlineImageUpload: React.FC<InlineImageUploadProps> = ({
  show,
  onClose,
  onImageInsert,
  planId,
  moduleId
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [altText, setAltText] = useState('');
  const [dragActive, setDragActive] = useState(false);

  if (!show) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a valid image file (JPEG, PNG, GIF, WebP, or SVG)',
        variant: 'destructive'
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB',
        variant: 'destructive'
      });
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Set default alt text from filename
    const filename = file.name.split('.')[0];
    setAltText(filename.replace(/[-_]/g, ' '));
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Create a unique filename
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${planId}/${moduleId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('course-content-images')
        .upload(fileName, selectedFile, {
          onUploadProgress: (progress) => {
            const percentage = (progress.loaded / progress.total) * 100;
            setUploadProgress(percentage);
          }
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('course-content-images')
        .getPublicUrl(fileName);

      // Insert image markdown into editor
      const imageMarkdown = `![${altText}](${publicUrl})`;
      onImageInsert(imageMarkdown);

      toast({
        title: 'Image uploaded successfully',
        description: 'The image has been inserted into your content',
      });

      // Reset and close
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload image. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAltText('');
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  return (
    <Card className="p-4 mb-4 bg-gray-50 border-2 border-dashed border-gray-300">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-sm flex items-center gap-2">
          <ImagePlus className="h-4 w-4" />
          Insert Image
        </h4>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6"
          onClick={handleCancel}
          aria-label="Close image upload"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      {!selectedFile ? (
        <div
          className={cn(
            "border rounded-lg p-6 text-center cursor-pointer transition-colors",
            dragActive ? "border-future-green bg-future-green/10" : "border-gray-300 bg-white hover:border-gray-400"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm font-medium mb-1">
            Drop your image here or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            JPEG, PNG, GIF, WebP, SVG (max 5MB)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileSelect}
          />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-3">
            {/* Preview */}
            <div className="relative rounded overflow-hidden bg-white border w-32 h-32 flex-shrink-0">
              <img
                src={previewUrl || ''}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-1 right-1 h-6 w-6 bg-white/80 hover:bg-white"
                onClick={resetForm}
                aria-label="Remove image"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>

            {/* Alt Text and Info */}
            <div className="flex-1 space-y-2">
              <div>
                <label htmlFor="inline-alt-text" className="text-xs font-medium text-gray-700">
                  Alt Text (for accessibility)
                </label>
                <input
                  id="inline-alt-text"
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Describe the image..."
                  className="w-full mt-1 px-2 py-1 text-sm border rounded"
                />
              </div>
              <div className="text-xs text-muted-foreground">
                {selectedFile.name} • {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span>Uploading...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-1.5" />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleUpload}
              disabled={!selectedFile || !altText || uploading}
              className="gap-1.5"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-3 w-3" />
                  Insert
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default InlineImageUpload;