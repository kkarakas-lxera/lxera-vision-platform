import React, { useState, useCallback } from 'react';
import { Upload, Download, AlertCircle, CheckCircle, Users, FileText, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ImportSession {
  id: string;
  import_type: string;
  total_employees: number;
  processed: number;
  successful: number;
  failed: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
}

interface CSVImportWizardProps {
  onImportComplete: () => void;
  importSessions: ImportSession[];
  defaultPositionId?: string;
}

interface CSVRow {
  name: string;
  email: string;
  department?: string;
  current_position?: string;
}

export function CSVImportWizard({ onImportComplete, importSessions, defaultPositionId }: CSVImportWizardProps) {
  const { userProfile } = useAuth();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState<'upload' | 'preview' | 'processing'>('upload');

  const downloadSampleCSV = () => {
    const sampleData = [
      ['name', 'email', 'department', 'current_position'],
      ['John Smith', 'john.smith@company.com', 'Engineering', 'Senior Developer'],
      ['Jane Doe', 'jane.doe@company.com', 'Operations', 'Project Manager'],
      ['Mike Johnson', 'mike.johnson@company.com', 'Engineering', 'Junior Developer']
    ];

    const csvContent = sampleData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'employee_import_sample.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const parseCSV = useCallback((file: File): Promise<CSVRow[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.trim().split('\n');
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          
          const requiredHeaders = ['name', 'email'];
          const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
          
          if (missingHeaders.length > 0) {
            reject(new Error(`Missing required headers: ${missingHeaders.join(', ')}`));
            return;
          }

          const data: CSVRow[] = [];
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            if (values.length >= 2 && values[0] && values[1]) {
              data.push({
                name: values[headers.indexOf('name')],
                email: values[headers.indexOf('email')],
                department: values[headers.indexOf('department')] || undefined,
                current_position: values[headers.indexOf('current_position')] || undefined
              });
            }
          }

          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  }, []);

  const validateCSVData = async (data: CSVRow[]): Promise<string[]> => {
    const errors: string[] = [];
    
    // Check for duplicate emails
    const emails = data.map(row => row.email);
    const duplicateEmails = emails.filter((email, index) => emails.indexOf(email) !== index);
    if (duplicateEmails.length > 0) {
      errors.push(`Duplicate emails found: ${[...new Set(duplicateEmails)].join(', ')}`);
    }

    // Validate email formats
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = data.filter(row => !emailRegex.test(row.email));
    if (invalidEmails.length > 0) {
      errors.push(`Invalid email formats: ${invalidEmails.map(r => r.email).join(', ')}`);
    }

    // Check if default position is provided
    if (!defaultPositionId) {
      errors.push('No position selected. Please select a position before importing.');
    }

    return errors;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    try {
      setCsvFile(file);
      const data = await parseCSV(file);
      setCsvData(data);
      
      const errors = await validateCSVData(data);
      setValidationErrors(errors);
      
      if (errors.length === 0) {
        setStep('preview');
      }
    } catch (error: any) {
      toast.error(`Failed to parse CSV: ${error.message}`);
      setCsvFile(null);
      setCsvData([]);
    }
  };

  const processImport = async () => {
    if (!userProfile?.company_id || csvData.length === 0) return;

    setUploading(true);
    setStep('processing');

    try {
      // Create import session
      const { data: importSession, error: sessionError } = await supabase
        .from('st_import_sessions')
        .insert({
          company_id: userProfile.company_id,
          import_type: 'employee_onboarding',
          total_employees: csvData.length,
          processed: 0,
          successful: 0,
          failed: 0,
          status: 'processing',
          created_by: userProfile.id,
          active_position_id: defaultPositionId || null,
          session_metadata: {
            has_default_position: !!defaultPositionId,
            import_method: 'csv_upload'
          }
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Process each employee
      let successful = 0;
      let failed = 0;

      // Get position details once, outside the loop
      let position = null;
      if (defaultPositionId) {
        const { data: positionData } = await supabase
          .from('st_company_positions')
          .select('id, position_code')
          .eq('id', defaultPositionId)
          .single();
        position = positionData;
      }

      for (const row of csvData) {
        try {
          // Check if user already exists
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', row.email)
            .single();

          let userId = existingUser?.id;

          if (!userId) {
            // Create new user
            const { data: newUser, error: userError } = await supabase
              .from('users')
              .insert({
                email: row.email,
                password_hash: '$2b$12$LQv3c1yqBwWFcZPMtS.4K.6P8vU6OxZdHJ5QKG8vY.7JZu9Z1QY6m', // Default password
                full_name: row.name,
                role: 'learner',
                company_id: userProfile.company_id,
                is_active: true,
                email_verified: false
              })
              .select()
              .single();

            if (userError) throw userError;
            userId = newUser.id;
          }

          // Create or update employee record
          const { error: employeeError } = await supabase
            .from('employees')
            .upsert({
              user_id: userId,
              company_id: userProfile.company_id,
              department: row.department,
              position: position?.position_code || row.current_position || 'Unassigned',
              current_position_id: defaultPositionId,
              target_position_id: defaultPositionId, // Same as current for skills analysis
              is_active: true
            });

          if (employeeError) throw employeeError;

          // Create import session item
          await supabase
            .from('st_import_session_items')
            .insert({
              import_session_id: importSession.id,
              employee_email: row.email,
              employee_name: row.name,
              current_position_code: position?.position_code,
              target_position_code: position?.position_code,
              status: 'completed',
              employee_id: userId
            });

          successful++;
        } catch (error) {
          console.error(`Failed to process ${row.email}:`, error);
          
          // Create failed import session item
          await supabase
            .from('st_import_session_items')
            .insert({
              import_session_id: importSession.id,
              employee_email: row.email,
              employee_name: row.name,
              current_position_code: position?.position_code || 'Unknown',
              target_position_code: position?.position_code || 'Unknown',
              status: 'failed',
              error_message: error instanceof Error ? error.message : 'Unknown error'
            });

          failed++;
        }
      }

      // Update import session
      await supabase
        .from('st_import_sessions')
        .update({
          processed: successful + failed,
          successful,
          failed,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', importSession.id);

      toast.success(`Import completed! ${successful} successful, ${failed} failed`);
      onImportComplete();
      
      // Reset form
      setCsvFile(null);
      setCsvData([]);
      setStep('upload');
      
    } catch (error: any) {
      console.error('Import failed:', error);
      toast.error(`Import failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  // State for dialog visibility
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    onImportComplete();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Employees via CSV
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file with employee information to bulk import your team members
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadSampleCSV}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Template
            </Button>
            <div className="text-sm text-muted-foreground">
              Required: name, email | Optional: department, current_position
            </div>
          </div>

          {step === 'upload' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="csvFile" className="text-foreground">Upload CSV File</Label>
                <Input
                  id="csvFile"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="text-foreground"
                />
              </div>

              {validationErrors.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Validation Errors:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {step === 'preview' && csvData.length > 0 && (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  CSV validated successfully! Found {csvData.length} employees ready to import.
                </AlertDescription>
              </Alert>

              <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
                <div className="text-sm font-medium mb-2">Preview (first 5 rows):</div>
                <div className="space-y-2">
                  {csvData.slice(0, 5).map((row, index) => (
                    <div key={index} className="flex items-center gap-4 text-sm border-b pb-2">
                      <span className="font-medium">{row.name}</span>
                      <span className="text-muted-foreground">{row.email}</span>
                      {row.department && <Badge variant="outline">{row.department}</Badge>}
                      {row.current_position && <span className="text-muted-foreground text-xs">{row.current_position}</span>}
                    </div>
                  ))}
                  {csvData.length > 5 && (
                    <div className="text-xs text-muted-foreground">
                      ... and {csvData.length - 5} more employees
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => setStep('upload')} variant="outline">
                  Back to Upload
                </Button>
                <Button onClick={processImport} disabled={uploading}>
                  {uploading ? 'Processing...' : `Import ${csvData.length} Employees`}
                </Button>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Processing import... This may take a few minutes for large files.
                </AlertDescription>
              </Alert>
              <Progress value={45} className="w-full" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}