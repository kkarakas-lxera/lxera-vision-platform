
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (bucket: string, file: File, path: string) => {
    try {
      setUploading(true);
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file);

      if (error) throw error;

      return { success: true, path: data.path };
    } catch (error: any) {
      console.error('Error uploading file:', error);
      return { success: false, error: error.message };
    } finally {
      setUploading(false);
    }
  };

  return { uploadFile, uploading };
};
