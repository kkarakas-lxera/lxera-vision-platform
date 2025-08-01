import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, Upload, FileSpreadsheet, AlertTriangle, Info } from 'lucide-react';
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
  const [selectedPosition, setSelectedPosition] = useState<string>('');
  const [positions, setPositions] = useState<any[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [spreadsheetEmployees, setSpreadsheetEmployees] = useState<SpreadsheetEmployee[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessionStats, setSessionStats] = useState<any>(null);

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
      const { data, error } = await supabase
        .from('employees')
        .select('department')
        .eq('company_id', userProfile.company_id)
        .not('department', 'is', null);

      if (error) throw error;
      
      const uniqueDepartments = [...new Set(data?.map(e => e.department).filter(Boolean))];
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
        if (data.default_position_id) {
          setSelectedPosition(data.default_position_id);
        }
        
        // Load existing items
        const existingEmployees = data.st_import_session_items.map((item: any) => ({
          id: item.id,
          name: item.employee_name,
          email: item.employee_email,
          department: item.department || '',
          position: item.position || '',
          position_code: item.position_code || '',
          manager_email: item.manager_email || '',
          status: item.status as any
        }));
        
        setSpreadsheetEmployees(existingEmployees);
        
        // Update session stats
        setSessionStats({
          total: data.st_import_session_items.length,
          ready: data.st_import_session_items.filter((i: any) => i.status === 'ready').length,
          errors: data.st_import_session_items.filter((i: any) => i.status === 'error').length
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
          spreadsheet_mode: true,
          default_position_id: selectedPosition || null
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

  const handleAddRow = () => {
    const newEmployee: SpreadsheetEmployee = {
      id: `temp-${Date.now()}-${Math.random()}`,
      name: '',
      email: '',
      department: '',
      position: positions.find(p => p.id === selectedPosition)?.position_title || '',
      position_code: positions.find(p => p.id === selectedPosition)?.position_code || '',
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
          sessionId: currentSessionId,
          defaultPositionId: selectedPosition
        }
      });

      if (error) throw error;

      toast.success(`Successfully activated ${data.activatedCount} employees`);
      
      // Reset the form
      setSpreadsheetEmployees([]);
      setCurrentSessionId(null);
      setSessionStats(null);
      
      onImportComplete();
    } catch (error) {
      console.error('Error activating employees:', error);
      toast.error('Failed to activate employees');
    } finally {
      setIsSubmitting(false);
    }
  };

  const readyCount = spreadsheetEmployees.filter(e => e.status === 'ready').length;
  const errorCount = spreadsheetEmployees.filter(e => e.status === 'error').length;

  return (
    <div className="space-y-6">
      {/* Position Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Select Default Position
          </CardTitle>
          <CardDescription>
            Choose a position that will be assigned to all imported employees by default
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedPosition} onValueChange={setSelectedPosition}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a position..." />
            </SelectTrigger>
            <SelectContent>
              {positions.map(position => (
                <SelectItem key={position.id} value={position.id}>
                  {position.position_title} ({position.position_code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {positions.length === 0 && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No positions found. Please create positions first before importing employees.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Session Status */}
      {currentSessionId && sessionStats && (
        <SessionStatusCard
          session={{
            id: currentSessionId,
            import_type: 'spreadsheet',
            total_employees: sessionStats.total || 0,
            processed: 0,
            successful: sessionStats.ready || 0,
            failed: sessionStats.errors || 0,
            status: 'pending',
            created_at: new Date().toISOString(),
            active_position_id: selectedPosition,
            session_metadata: {
              position_title: positions.find(p => p.id === selectedPosition)?.position_title
            }
          }}
          positionTitle={positions.find(p => p.id === selectedPosition)?.position_title}
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
            {spreadsheetEmployees.length > 0 && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="bg-green-50">
                    {readyCount} ready
                  </Badge>
                  {errorCount > 0 && (
                    <Badge variant="outline" className="bg-red-50">
                      {errorCount} errors
                    </Badge>
                  )}
                </div>
              </div>
            )}
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
          <div className="flex items-center justify-between mt-6">
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
        </CardContent>
      </Card>
    </div>
  );
}