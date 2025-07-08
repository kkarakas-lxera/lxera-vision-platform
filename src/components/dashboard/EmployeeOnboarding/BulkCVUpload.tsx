
import React, { useState, useEffect } from 'react';
import { ResponsiveModal } from '@/components/mobile/modals/ResponsiveModal';
import { Button } from '@/components/ui/button';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { CVUploadDialog } from './CVUploadDialog';

interface BulkCVUploadProps {
  onUploadComplete?: () => Promise<void>;
  isOpen?: boolean;
  onClose?: () => void;
  onComplete?: () => void;
}

interface EmployeeWithoutCV {
  id: string;
  full_name: string;
  email: string;
  position: string | null;
}

export const BulkCVUpload: React.FC<BulkCVUploadProps> = ({ 
  onUploadComplete,
  isOpen = false,
  onClose,
  onComplete
}) => {
  const { userProfile } = useAuth();
  const [employees, setEmployees] = useState<EmployeeWithoutCV[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithoutCV | null>(null);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    if (isOpen && userProfile?.company_id) {
      fetchEmployeesWithoutCV();
    }
  }, [isOpen, userProfile?.company_id]);

  const fetchEmployeesWithoutCV = async () => {
    if (!userProfile?.company_id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('v_company_employees')
        .select('id, full_name, email, position')
        .eq('company_id', userProfile.company_id)
        .is('cv_file_path', null)
        .order('full_name');

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    await fetchEmployeesWithoutCV();
    if (employees.length === 0) {
      onComplete?.();
      onClose?.();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <ResponsiveModal
        open={isOpen}
        onOpenChange={(open) => !open && onClose?.()}
        title="Bulk CV Upload"
        mobileMode="fullscreen"
        className="max-w-4xl"
      >
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : employees.length === 0 ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                All employees have CVs uploaded. Great job!
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {employees.length} employee{employees.length !== 1 ? 's' : ''} without CVs found. Click on an employee to upload their CV.
                </AlertDescription>
              </Alert>

              {uploadProgress.total > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Upload Progress</span>
                    <span>{uploadProgress.current} / {uploadProgress.total}</span>
                  </div>
                  <Progress value={(uploadProgress.current / uploadProgress.total) * 100} />
                </div>
              )}

              <div className="grid gap-2 max-h-96 overflow-y-auto">
                {employees.map((employee) => (
                  <Card 
                    key={employee.id} 
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => setSelectedEmployee(employee)}
                  >
                    <CardHeader className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">{employee.full_name}</CardTitle>
                          <CardDescription className="text-sm">
                            {employee.email} • {employee.position || 'No position'}
                          </CardDescription>
                        </div>
                        <Button size="sm" variant="outline">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload CV
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </ResponsiveModal>

      {selectedEmployee && (
        <CVUploadDialog
          employee={{
            id: selectedEmployee.id,
            name: selectedEmployee.full_name,
            email: selectedEmployee.email
          }}
          open={!!selectedEmployee}
          onOpenChange={(open) => !open && setSelectedEmployee(null)}
          onUploadComplete={handleComplete}
        />
      )}
    </>
  );
};

export default BulkCVUpload;
