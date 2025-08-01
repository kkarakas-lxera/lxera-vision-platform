import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, Upload, FileSpreadsheet, AlertTriangle, Info, CheckCircle, ArrowRight } from 'lucide-react';
import SpreadsheetGrid, { Employee as SpreadsheetEmployee } from '@/components/TeamSetup/SpreadsheetGrid';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAutoSaveEmployees } from '@/hooks/useAutoSaveEmployees';
import { SessionStatusCard } from '@/components/dashboard/EmployeeOnboarding/SessionStatusCard';

interface ImportTabProps {
  userProfile: any;
  onImportComplete: () => void;
}

export function ImportTab({ userProfile, onImportComplete }: ImportTabProps) {
  const [positions, setPositions] = useState<any[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [spreadsheetEmployees, setSpreadsheetEmployees] = useState<SpreadsheetEmployee[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessionStats, setSessionStats] = useState<any>(null);
  const [sessionCreatedAt, setSessionCreatedAt] = useState<string | null>(null);
  const [showSuccessState, setShowSuccessState] = useState(false);
  const [activatedCount, setActivatedCount] = useState(0);

  // Auto-save hook
  const { saveStatus, lastSaved, handleCellSave } = useAutoSaveEmployees(
    currentSessionId,
    spreadsheetEmployees,
    setSpreadsheetEmployees
  );

  useEffect(() => {
    if (userProfile?.company_id) {
      fetchPositions();
      fetchDepartments();
      checkExistingSession();
    }
  }, [userProfile?.company_id]);

  // Initialize with 5 empty rows if no session exists
  useEffect(() => {
    if (userProfile?.company_id && !currentSessionId && spreadsheetEmployees.length === 0) {
      const emptyRows: SpreadsheetEmployee[] = Array.from({ length: 5 }, (_, i) => ({
        id: `temp-${Date.now()}-${i}-${Math.random()}`,
        name: '',
        email: '',
        department: '',
        position: '',
        position_code: '',
        manager_email: '',
        status: 'pending'
      }));
      setSpreadsheetEmployees(emptyRows);
    }
  }, [userProfile?.company_id, currentSessionId]);

  const fetchPositions = async () => {
    try {
      const { data, error } = await supabase
        .from('st_company_positions')
        .select('*')
        .eq('company_id', userProfile.company_id)
        .order('position_title');

      if (error) throw error;
      setPositions(data || []);
    } catch (error) {
      console.error('Error fetching positions:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      // Try to get departments from employees first
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('department')
        .eq('company_id', userProfile.company_id)
        .not('department', 'is', null);

      if (employeeError) throw employeeError;
      
      // Also get departments from positions
      const { data: positionData, error: positionError } = await supabase
        .from('st_company_positions')
        .select('department')
        .eq('company_id', userProfile.company_id)
        .not('department', 'is', null);

      if (positionError) throw positionError;
      
      // Combine departments from both sources
      const allDepartments = [
        ...(employeeData?.map(e => e.department) || []),
        ...(positionData?.map(p => p.department) || [])
      ];
      
      const uniqueDepartments = [...new Set(allDepartments.filter(Boolean))];
      setDepartments(uniqueDepartments);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const checkExistingSession = async () => {
    try {
      const { data, error } = await supabase
        .from('st_import_sessions')
        .select('*, st_import_session_items(*)')
        .eq('company_id', userProfile.company_id)
        .eq('status', 'pending')
        .eq('spreadsheet_mode', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data && !error) {
        setCurrentSessionId(data.id);
        setSessionCreatedAt(data.created_at);
        
        // Load existing items
        const existingEmployees = data.st_import_session_items.map((item: any) => ({
          id: item.id,
          name: item.employee_name || '',
          email: item.employee_email || '',
          department: item.field_values?.department || '',
          position: item.field_values?.position || '',
          position_code: item.current_position_code || '',
          manager_email: item.field_values?.manager_email || '',
          // Map database status back to frontend status
          status: item.status === 'completed' ? 'ready' : 
                  item.status === 'failed' ? 'error' : 
                  item.status as any
        }));
        
        // If no existing employees, initialize with 5 empty rows
        if (existingEmployees.length === 0) {
          const emptyRows: SpreadsheetEmployee[] = Array.from({ length: 5 }, (_, i) => ({
            id: `temp-${Date.now()}-${i}-${Math.random()}`,
            name: '',
            email: '',
            department: '',
            position: '',
            position_code: '',
            manager_email: '',
            status: 'pending'
          }));
          setSpreadsheetEmployees(emptyRows);
        } else {
          setSpreadsheetEmployees(existingEmployees);
        }
        
        // Update session stats
        setSessionStats({
          total: data.st_import_session_items.length,
          ready: data.st_import_session_items.filter((i: any) => i.status === 'completed').length,
          errors: data.st_import_session_items.filter((i: any) => i.status === 'failed').length
        });
      }
    } catch (error) {
      console.error('Error checking existing session:', error);
    }
  };

  const createImportSession = async () => {
    try {
      const { data, error } = await supabase
        .from('st_import_sessions')
        .insert({
          company_id: userProfile.company_id,
          status: 'pending',
          total_employees: 0,
          spreadsheet_mode: true
        })
        .select()
        .single();

      if (error) throw error;
      
      setCurrentSessionId(data.id);
      return data.id;
    } catch (error) {
      console.error('Error creating import session:', error);
      throw error;
    }
  };

  const handleAddRow = async () => {
    // Create session if it doesn't exist
    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = await createImportSession();
    }
    
    const newEmployee: SpreadsheetEmployee = {
      id: `temp-${Date.now()}-${Math.random()}`,
      name: '',
      email: '',
      department: '',
      position: '',
      position_code: '',
      manager_email: '',
      status: 'pending'
    };
    
    setSpreadsheetEmployees([...spreadsheetEmployees, newEmployee]);
  };

  const handleRowDelete = async (rowId: string) => {
    if (!rowId.startsWith('temp-') && !rowId.startsWith('new-')) {
      try {
        await supabase
          .from('st_import_session_items')
          .delete()
          .eq('id', rowId);
      } catch (error) {
        console.error('Error deleting row:', error);
      }
    }
    
    setSpreadsheetEmployees(spreadsheetEmployees.filter(e => e.id !== rowId));
  };

  const handleActivateEmployees = async () => {
    if (!currentSessionId) {
      toast.error('No active import session');
      return;
    }

    const readyEmployees = spreadsheetEmployees.filter(e => e.status === 'ready');
    if (readyEmployees.length === 0) {
      toast.error('No employees are ready to be activated');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Activate employees via edge function
      const { data, error } = await supabase.functions.invoke('activate-import-session', {
        body: { 
          sessionId: currentSessionId
        }
      });

      if (error) throw error;

      if (data.activatedCount > 0) {
        toast.success(`Successfully activated ${data.activatedCount} employees`);
        
        // Show success state instead of resetting immediately
        setActivatedCount(data.activatedCount);
        setShowSuccessState(true);
        
        // Call onImportComplete to refresh the parent data
        onImportComplete();
      } else {
        toast.error('No employees were activated. Please check for errors and try again.');
        // Refresh the session to show updated error states
        checkExistingSession();
      }
    } catch (error) {
      console.error('Error activating employees:', error);
      toast.error('Failed to activate employees');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Only count employees that have at least name or email filled
  const employeesWithContent = spreadsheetEmployees.filter(e => e.name?.trim() || e.email?.trim());
  const readyCount = employeesWithContent.filter(e => e.status === 'ready').length;
  const errorCount = employeesWithContent.filter(e => e.status === 'error').length;

  // Show loading if userProfile not ready
  if (!userProfile?.company_id) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // Show success state if activation completed
  if (showSuccessState) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-12">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-4 bg-green-100 rounded-full">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold text-gray-900">
                  Successfully Activated {activatedCount} Employee{activatedCount !== 1 ? 's' : ''}!
                </h3>
                <p className="text-gray-600">
                  Your employees have been added to the system and are ready to receive invitations.
                </p>
              </div>

              <div className="pt-4">
                <Button 
                  size="lg" 
                  className="group"
                  onClick={() => {
                    // Switch to invitations tab
                    const invitationsTab = document.querySelector('[value="invitations"]') as HTMLButtonElement;
                    if (invitationsTab) {
                      invitationsTab.click();
                    }
                  }}
                >
                  Send Invitations
                  <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
                
                <p className="text-sm text-gray-500 mt-4">
                  or{' '}
                  <button 
                    className="text-blue-600 hover:underline"
                    onClick={() => {
                      setShowSuccessState(false);
                      setSpreadsheetEmployees([]);
                      setCurrentSessionId(null);
                      setSessionStats(null);
                    }}
                  >
                    import more employees
                  </button>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Session Status */}
      {currentSessionId && employeesWithContent.length > 0 && (
        <SessionStatusCard
          session={{
            id: currentSessionId,
            import_type: 'spreadsheet',
            total_employees: employeesWithContent.length,
            processed: 0,
            successful: readyCount,
            failed: errorCount,
            status: 'pending',
            created_at: sessionCreatedAt || new Date().toISOString()
          }}
          positionTitle={null}
        />
      )}

      {/* Spreadsheet Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Import Employees
              </CardTitle>
              <CardDescription>
                Add employees using the spreadsheet interface below
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <SpreadsheetGrid
            employees={spreadsheetEmployees}
            onEmployeesChange={setSpreadsheetEmployees}
            onRowDelete={handleRowDelete}
            onCellSave={handleCellSave}
            isLoading={isSubmitting}
            saveStatus={saveStatus}
            lastSaved={lastSaved}
            departments={departments}
            positions={positions}
          />
          
          {/* Actions */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <Alert className="flex-1 mr-4">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Employees are saved automatically as you type. Click "Activate Employees" when ready to finalize.
                </AlertDescription>
              </Alert>
              
              <Button
                onClick={handleActivateEmployees}
                disabled={readyCount === 0 || isSubmitting}
                size="lg"
              >
                <Upload className="h-4 w-4 mr-2" />
                Activate {readyCount} Employee{readyCount !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}