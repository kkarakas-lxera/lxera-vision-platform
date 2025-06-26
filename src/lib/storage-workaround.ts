import { supabase } from '@/integrations/supabase/client';

/**
 * Alternative CV upload approach using base64 encoding
 * This stores the CV data in the database instead of storage
 */
export async function uploadCVToDatabase(
  file: File,
  employeeId: string,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check file size (limit to 5MB for database storage)
    if (file.size > 5 * 1024 * 1024) {
      return { 
        success: false, 
        error: 'File size must be less than 5MB for database storage' 
      };
    }

    if (onProgress) onProgress(20);

    // Convert file to base64
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
    reader.readAsDataURL(file);
    
    const base64Data = await base64Promise;
    
    if (onProgress) onProgress(40);

    // Store in database
    const cvData = {
      employee_id: employeeId,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      file_data: base64Data,
      uploaded_at: new Date().toISOString()
    };

    // First check if a CV record exists
    const { data: existing } = await supabase
      .from('employee_cv_data')
      .select('id')
      .eq('employee_id', employeeId)
      .single();

    if (onProgress) onProgress(60);

    let result;
    if (existing) {
      // Update existing record
      result = await supabase
        .from('employee_cv_data')
        .update(cvData)
        .eq('employee_id', employeeId);
    } else {
      // Insert new record
      result = await supabase
        .from('employee_cv_data')
        .insert(cvData);
    }

    if (result.error) {
      console.error('Database storage error:', result.error);
      return { 
        success: false, 
        error: result.error.message 
      };
    }

    if (onProgress) onProgress(80);

    // Update employee record with database storage marker
    const { error: updateError } = await supabase
      .from('employees')
      .update({ 
        cv_file_path: `db:${employeeId}` // Special marker indicating CV is in database
      })
      .eq('id', employeeId);

    if (updateError) {
      console.error('Failed to update employee cv_file_path:', updateError);
      // Don't fail the upload, just log the error
    }

    if (onProgress) onProgress(90);

    // Trigger CV analysis for database-stored CV
    try {
      console.log('Triggering CV analysis for database-stored CV...');
      const { error: analysisError } = await supabase.functions.invoke('analyze-cv', {
        body: { 
          employee_id: employeeId,
          file_path: `db:${employeeId}`,
          source: 'database' // Flag to indicate CV is in database
        }
      });

      if (analysisError) {
        console.warn('CV analysis failed:', analysisError);
        // Don't fail the upload, analysis can be retried
      } else {
        console.log('CV analysis triggered successfully');
      }
    } catch (error) {
      console.warn('Failed to trigger CV analysis:', error);
    }

    if (onProgress) onProgress(100);

    return { success: true };

  } catch (error) {
    console.error('CV database upload error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Retrieve CV from database
 */
export async function getCVFromDatabase(employeeId: string): Promise<{
  success: boolean;
  data?: {
    fileName: string;
    fileType: string;
    fileData: string;
  };
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('employee_cv_data')
      .select('file_name, file_type, file_data')
      .eq('employee_id', employeeId)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: 'No CV found' };
    }

    return {
      success: true,
      data: {
        fileName: data.file_name,
        fileType: data.file_type,
        fileData: data.file_data
      }
    };

  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Create the database table for CV storage (run this in SQL editor)
 */
export const CREATE_CV_TABLE_SQL = `
-- Create table for storing CV data directly
CREATE TABLE IF NOT EXISTS employee_cv_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_data TEXT NOT NULL, -- Base64 encoded file content
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(employee_id)
);

-- Create RLS policies
ALTER TABLE employee_cv_data ENABLE ROW LEVEL SECURITY;

-- Policy for company admins to manage CVs
CREATE POLICY "Company admins can manage CV data"
ON employee_cv_data
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM employees e
    JOIN users u ON u.id = auth.uid()
    WHERE e.id = employee_cv_data.employee_id
    AND e.company_id = u.company_id
    AND u.role IN ('company_admin', 'super_admin')
  )
);

-- Add columns to employees table
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS cv_uploaded BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS cv_uploaded_at TIMESTAMPTZ;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_employee_cv_data_employee_id ON employee_cv_data(employee_id);
`;

// Make available globally for testing
if (typeof window !== 'undefined') {
  (window as any).uploadCVToDatabase = uploadCVToDatabase;
  (window as any).getCVFromDatabase = getCVFromDatabase;
}