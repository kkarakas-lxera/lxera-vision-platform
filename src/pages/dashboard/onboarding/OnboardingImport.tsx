import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Users, Save, AlertCircle, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import SpreadsheetGrid, { Employee } from '@/components/TeamSetup/SpreadsheetGrid';
import { useSpreadsheetAutoSave } from '@/hooks/useSpreadsheetAutoSave';
import { SpreadsheetErrorBoundary } from '@/components/TeamSetup/SpreadsheetErrorBoundary';

export default function OnboardingImport() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { importSessions, stats, loading, refreshData } = useOnboarding();
  const [defaultPosition, setDefaultPosition] = useState<string>('');
  const [positions, setPositions] = useState<{ id: string; position_code: string; position_title: string; department?: string }[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [showPositionSelector, setShowPositionSelector] = useState(false);

  // Initialize empty rows ONLY after session is ready
  useEffect(() => {
    if (employees.length === 0 && currentSessionId && !sessionLoading) {
      // Start with 5 empty rows
      const emptyRows: Employee[] = Array.from({ length: 5 }, (_, i) => ({
        id: `new-${Date.now()}-${i}`,
        name: '',
        email: '',
        department: '',
        position: '',
        position_code: '',
        manager_email: '',
        status: 'pending'
      }));
      setEmployees(emptyRows);
    }
  }, [currentSessionId, sessionLoading]);

  // Load positions and existing session on mount
  useEffect(() => {
    loadPositions();
    loadOrCreateSession();
  }, []);

  const loadPositions = async () => {
    if (!userProfile?.company_id) return;
    
    try {
      const { data, error } = await supabase
        .from('st_company_positions')
        .select('id, position_code, position_title, department')
        .eq('company_id', userProfile.company_id)
        .order('position_title');
      
      if (error) throw error;
      setPositions(data || []);
      
      // Extract unique departments
      const uniqueDepartments = [...new Set(
        (data || [])
          .map(p => p.department)
          .filter(d => d && d.trim() !== '') // Remove null/undefined/empty strings
      )].sort();
      
      setDepartments(uniqueDepartments);
    } catch (error) {
      console.error('Error loading positions:', error);
    }
  };

  const loadOrCreateSession = async () => {
    if (!userProfile?.company_id || !userProfile?.id) return;
    
    setSessionLoading(true);
    try {
      // Check for existing active session
      const { data: existingSessions, error: fetchError } = await supabase
        .from('st_import_sessions')
        .select('id, active_position_id')
        .eq('company_id', userProfile.company_id)
        .eq('import_type', 'employee_onboarding')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      const existingSession = existingSessions?.[0];

      if (existingSession) {
        setCurrentSessionId(existingSession.id);
        if (existingSession.active_position_id) {
          setDefaultPosition(existingSession.active_position_id);
        }
        // Load existing employees from session
        await loadSessionEmployees(existingSession.id);
      } else {
        // Create new session
        const { data: newSession, error: createError } = await supabase
          .from('st_import_sessions')
          .insert({
            company_id: userProfile.company_id,
            import_type: 'employee_onboarding',
            total_employees: 0,
            processed: 0,
            successful: 0,
            failed: 0,
            status: 'pending',
            created_by: userProfile.id,
            spreadsheet_mode: true,
            checklist_state: {},
            last_active: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) throw createError;
        setCurrentSessionId(newSession.id);
      }
    } catch (error) {
      console.error('Error loading/creating session:', error);
      toast.error('Failed to initialize import session');
    } finally {
      setSessionLoading(false);
    }
  };

  const loadSessionEmployees = async (sessionId: string) => {
    try {
      // Use RPC function to get spreadsheet rows
      const { data, error } = await supabase.rpc('get_spreadsheet_rows', {
        p_session_id: sessionId
      });

      if (error) throw error;

      if (data && data.length > 0) {
        const loadedEmployees: Employee[] = data.map((item: {
          id: string;
          employee_name?: string;
          employee_email?: string;
          field_values?: any;
          current_position_code?: string;
          status: string;
        }) => ({
          id: item.id,
          name: item.employee_name || item.field_values?.name || '',
          email: item.employee_email || item.field_values?.email || '',
          department: item.field_values?.department || '',
          position: item.field_values?.position || item.current_position_code || '',
          position_code: item.field_values?.position_code || item.current_position_code || '',
          manager_email: item.field_values?.manager_email || '',
          status: item.status as Employee['status'],
          errorMessage: undefined
        }));
        setEmployees(loadedEmployees);
      }
    } catch (error) {
      console.error('Error loading session employees:', error);
      toast.error('Failed to load existing employees');
    }
  };

  // Auto-save configuration using RPC functions
  const {
    saveStatus,
    error: saveError,
    pendingChanges,
    offlineQueue,
    saveNow,
    saveCellNow
  } = useSpreadsheetAutoSave(employees, {
    sessionId: currentSessionId,
    delay: 500, // Reduced from 1000ms for better UX
    onSuccess: () => {
      console.log('Batch save successful');
    },
    onError: (error) => {
      console.error('Batch save failed:', error);
      toast.error('Failed to save changes. Will retry automatically.');
    },
    onIdUpdate: (tempId: string, newId: string) => {
      // Replace temporary ID with the real database ID
      setEmployees(prev => prev.map(emp => 
        emp.id === tempId ? { ...emp, id: newId } : emp
      ));
    }
  });

  // Debug logging
  useEffect(() => {
    console.log('[OnboardingImport] currentSessionId:', currentSessionId);
    console.log('[OnboardingImport] employees count:', employees.length);
    console.log('[OnboardingImport] saveStatus:', saveStatus);
  }, [currentSessionId, employees.length, saveStatus]);

  const handleEmployeesChange = (updatedEmployees: Employee[]) => {
    setEmployees(updatedEmployees);
    
    // Ensure at least 5 empty rows at the bottom
    const nonEmptyCount = updatedEmployees.filter(e => e.name || e.email).length;
    const emptyCount = updatedEmployees.length - nonEmptyCount;
    
    if (emptyCount < 5) {
      const newEmptyRows = Array.from({ length: 5 - emptyCount }, (_, i) => ({
        id: `new-${Date.now()}-${i}`,
        name: '',
        email: '',
        department: '',
        position: '',
        position_code: '',
        manager_email: '',
        status: 'pending' as const
      }));
      setEmployees([...updatedEmployees, ...newEmptyRows]);
    }
  };

  const handleRowDelete = async (id: string) => {
    if (id.startsWith('new-') || id.startsWith('temp-')) {
      // Just remove from state if not saved yet
      setEmployees(employees.filter(e => e.id !== id));
    } else {
      try {
        // Use RPC function for soft delete
        const { error } = await supabase.rpc('soft_delete_row', {
          p_item_id: id
        });
        
        if (error) throw error;
        
        setEmployees(employees.filter(e => e.id !== id));
        toast.success('Row deleted');
      } catch (error) {
        console.error('Failed to delete row:', error);
        toast.error('Failed to delete row');
      }
    }
  };

  const handlePositionSelect = async () => {
    if (!defaultPosition || !currentSessionId) return;
    
    // Update session with selected position
    await supabase
      .from('st_import_sessions')
      .update({ active_position_id: defaultPosition })
      .eq('id', currentSessionId);
    
    // Apply position to employees without one
    const position = positions.find(p => p.id === defaultPosition);
    if (position) {
      const updatedEmployees = employees.map(emp => {
        if (!emp.position && !emp.position_code && (emp.name || emp.email)) {
          return {
            ...emp,
            position: position.position_title,
            position_code: position.position_code
          };
        }
        return emp;
      });
      setEmployees(updatedEmployees);
    }
    
    setShowPositionSelector(false);
  };

  const activateEmployees = async () => {
    if (!currentSessionId) return;
    
    setIsImporting(true);
    
    try {
      // Get ready employees
      const readyEmployees = employees.filter(e => 
        e.status === 'ready' && e.name && e.email
      );
      
      if (readyEmployees.length === 0) {
        toast.error('No employees ready to activate');
        setIsImporting(false);
        return;
      }
      
      let successful = 0;
      let failed = 0;

      // Update session status
      await supabase
        .from('st_import_sessions')
        .update({
          status: 'processing',
          total_employees: readyEmployees.length
        })
        .eq('id', currentSessionId);

      // Process each employee
      for (const employee of readyEmployees) {
        try {
          // Determine position
          let positionId = defaultPosition || null;
          let positionCode = employee.position_code || employee.position || 'Unassigned';
          
          // If we have a position ID from dropdown, use it
          if (defaultPosition) {
            const pos = positions.find(p => p.id === defaultPosition);
            if (pos) {
              positionCode = pos.position_code || pos.position_title;
              positionId = defaultPosition;
            }
          }

          // Check if user exists
          const { data: checkResult } = await supabase
            .rpc('check_user_exists_by_email', { p_email: employee.email });

          let userId = checkResult?.[0]?.user_exists ? checkResult[0].user_id : null;

          if (!userId) {
            // Create new user
            const { data: newUserId, error: userError } = await supabase
              .rpc('create_company_user', {
                p_email: employee.email,
                p_password_hash: '$2b$12$LQv3c1yqBwWFcZPMtS.4K.6P8vU6OxZdHJ5QKG8vY.7JZu9Z1QY6m',
                p_full_name: employee.name,
                p_role: 'learner'
              });

            if (userError) throw userError;
            userId = newUserId;
          }

          // Create or update employee record
          const { error: employeeError } = await supabase
            .from('employees')
            .upsert({
              user_id: userId,
              company_id: userProfile?.company_id,
              department: employee.department || 'General',
              position: positionCode,
              current_position_id: positionId,
              target_position_id: positionId,
              is_active: true
            });

          if (employeeError) throw employeeError;

          // Update import session item
          await supabase
            .from('st_import_session_items')
            .update({
              status: 'completed',
              employee_id: userId
            })
            .eq('id', employee.id);

          successful++;
        } catch (error) {
          console.error(`Failed to process ${employee.email}:`, error);
          failed++;
          
          await supabase
            .from('st_import_session_items')
            .update({
              status: 'failed',
              error_message: error instanceof Error ? error.message : 'Unknown error'
            })
            .eq('id', employee.id);
        }
      }

      // Update session status
      await supabase
        .from('st_import_sessions')
        .update({
          processed: successful + failed,
          successful,
          failed,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', currentSessionId);

      await refreshData();
      
      if (successful > 0) {
        toast.success(`Successfully activated ${successful} employees`);
        // Navigate to next step after short delay
        setTimeout(() => {
          navigate('/dashboard/onboarding/invite');
        }, 2000);
      } else {
        toast.error('Failed to activate employees');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to activate employees');
    } finally {
      setIsImporting(false);
    }
  };

  const isTrialFull = stats.total >= 10;
  const readyCount = employees.filter(e => e.status === 'ready').length;
  const canActivate = readyCount > 0 && !isTrialFull;

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard/onboarding')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Overview
          </Button>
          <div className="h-5 w-px bg-gray-300" />
          <div>
            <h1 className="text-2xl font-bold">Import Team Members</h1>
            <p className="text-sm text-muted-foreground">
              Step 1 of 3 • Add your team members to get started
            </p>
          </div>
        </div>
        
        <Badge variant="default">Step 1</Badge>
      </div>

      {/* Progress Steps */}
      <Card className="overflow-hidden">
        <CardContent className="p-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <span className="font-medium text-sm">Import</span>
            </div>
            <div className="h-0.5 flex-1 bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                stats.total > 0 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-500'
              }`}>
                2
              </div>
              <span className={`text-sm ${stats.total > 0 ? 'text-blue-700' : 'text-gray-500'}`}>
                Invite
              </span>
            </div>
            <div className="h-0.5 flex-1 bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                stats.analyzed > 0
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-500'
              }`}>
                3
              </div>
              <span className={`text-sm ${stats.analyzed > 0 ? 'text-blue-700' : 'text-gray-500'}`}>
                Analysis
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Position Selector (if needed) */}
      {showPositionSelector && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-medium">Select Default Position</h3>
                <p className="text-sm text-muted-foreground">
                  This position will be applied to employees without one
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Select value={defaultPosition} onValueChange={setDefaultPosition}>
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((position) => (
                      <SelectItem key={position.id} value={position.id}>
                        {position.position_title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handlePositionSelect}
                  disabled={!defaultPosition}
                >
                  Apply
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Spreadsheet Area */}
      <div className="space-y-4">
        {/* Offline/Error Status */}
        {(offlineQueue > 0 || saveError) && (
          <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-900">
                  {!navigator.onLine ? 'Working offline' : 'Connection issues'}
                </p>
                <p className="text-xs text-yellow-700">
                  {offlineQueue > 0 && `${offlineQueue} changes pending`}
                  {saveError && ` - ${saveError.message}`}
                </p>
              </div>
            </div>
            {pendingChanges > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={saveNow}
                disabled={saveStatus === 'saving'}
              >
                {saveStatus === 'saving' ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  'Retry Now'
                )}
              </Button>
            )}
          </div>
        )}

        {/* Trial Progress */}
        {!isTrialFull && (
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
            <div>
              <p className="text-sm font-medium">Trial Progress</p>
              <p className="text-xs text-muted-foreground">
                {stats.total} of 10 employees used
              </p>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < stats.total ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Spreadsheet Grid */}
        {isTrialFull ? (
          <Card>
            <CardContent className="py-16 text-center space-y-4">
              <h3 className="text-lg font-medium">Trial limit reached</h3>
              <p className="text-muted-foreground">You've imported 10 employees</p>
              <div className="space-y-2">
                <Button className="w-full max-w-xs">
                  Upgrade to Pro <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full max-w-xs"
                  onClick={() => navigate('/dashboard/onboarding/invite')}
                >
                  Continue to invitations
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <SpreadsheetErrorBoundary>
            <SpreadsheetGrid
              employees={employees}
              onEmployeesChange={handleEmployeesChange}
              onRowDelete={handleRowDelete}
              onCellSave={saveCellNow}
              isLoading={isImporting || sessionLoading || !currentSessionId}
              saveStatus={saveStatus}
              departments={departments}
              positions={positions}
            />
          </SpreadsheetErrorBoundary>
        )}

        {/* Action Bar */}
        {!isTrialFull && (
          <div className="flex items-center justify-between bg-white border rounded-lg p-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {readyCount} employee{readyCount !== 1 ? 's' : ''} ready
              </p>
              <p className="text-xs text-muted-foreground">
                {employees.filter(e => !e.name || !e.email).length} incomplete
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!defaultPosition && employees.some(e => !e.position && (e.name || e.email)) && (
                <Button
                  variant="outline"
                  onClick={() => setShowPositionSelector(true)}
                >
                  Set Default Position
                </Button>
              )}
              <Button
                onClick={activateEmployees}
                disabled={!canActivate || isImporting}
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Activating...
                  </>
                ) : (
                  <>
                    Activate {readyCount} Employee{readyCount !== 1 ? 's' : ''}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}