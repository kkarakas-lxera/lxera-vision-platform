import { supabase } from '@/integrations/supabase/client';

/**
 * Upload CV using Edge Function (bypasses storage RLS issues)
 */
export async function uploadCVViaEdgeFunction(
  file: File,
  employeeId: string,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; filePath?: string; error?: string }> {
  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return { success: false, error: 'No authenticated session' };
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('employeeId', employeeId);

    // Update progress
    if (onProgress) onProgress(30);

    // Call edge function
    const response = await fetch(
      `${supabase.supabaseUrl}/functions/v1/upload-cv`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabase.supabaseKey
        },
        body: formData
      }
    );

    if (onProgress) onProgress(60);

    const result = await response.json();

    if (!response.ok) {
      console.error('Edge function error:', result);
      return { 
        success: false, 
        error: result.error || `Upload failed: ${response.statusText}` 
      };
    }

    if (onProgress) onProgress(100);

    return { 
      success: true, 
      filePath: result.filePath 
    };

  } catch (error) {
    console.error('Upload error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

/**
 * Test if edge function is available
 */
export async function testEdgeFunctionAvailability(): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;

    const response = await fetch(
      `${supabase.supabaseUrl}/functions/v1/upload-cv`,
      {
        method: 'OPTIONS',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabase.supabaseKey
        }
      }
    );

    return response.ok;
  } catch {
    return false;
  }
}