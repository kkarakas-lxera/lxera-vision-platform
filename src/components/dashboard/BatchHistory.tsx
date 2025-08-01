import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { History, Users, CheckCircle, AlertCircle, RefreshCw, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface BatchHistoryProps {
  companyId: string;
  onRestore?: (sessionId: string) => void;
}

interface ImportSession {
  id: string;
  created_at: string;
  created_by: string;
  total_employees: number;
  successful: number;
  failed: number;
  spreadsheet_mode: boolean;
  created_by_name: string;
  current_active_employees: number;
  batch_details?: {
    added_employees: Array<{
      id: string;
      name: string;
      email: string;
      is_active: boolean;
    }>;
  };
}

export function BatchHistory({ companyId, onRestore }: BatchHistoryProps) {
  const [sessions, setSessions] = useState<ImportSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<ImportSession | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);

  useEffect(() => {
    if (companyId) {
      fetchImportHistory();
    }
  }, [companyId]);

  const fetchImportHistory = async () => {
    setLoading(true);
    try {
      // Get import sessions with user names and employee counts
      const { data, error } = await supabase
        .from('st_import_sessions')
        .select(`
          *,
          users!created_by(full_name)
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Transform the data to include created_by_name and calculate current_active_employees
      const sessionsWithDetails = await Promise.all(
        (data || []).map(async (session) => {
          let activeCount = 0;
          
          try {
            // Try to get current active employees count for this session
            const { count, error } = await supabase
              .from('employees')
              .select('*', { count: 'exact', head: true })
              .eq('import_session_id', session.id)
              .eq('is_active', true);
              
            if (error) {
              // If the query fails due to missing column, use alternative approach
              if (error.message?.includes('import_session_id') || error.code === '42703') {
                console.warn('import_session_id column not found, using alternative count method');
                
                // Count via session items and employee lookup
                const { data: sessionItems, error: itemsError } = await supabase
                  .from('st_import_session_items')
                  .select(`
                    employee_id,
                    employees!inner(is_active)
                  `)
                  .eq('import_session_id', session.id)
                  .not('employee_id', 'is', null);

                if (!itemsError && sessionItems) {
                  activeCount = sessionItems.filter(item => item.employees?.is_active).length;
                }
              } else {
                console.error('Error counting active employees:', error);
              }
            } else {
              activeCount = count || 0;
            }
          } catch (countError) {
            console.error('Failed to count active employees for session:', session.id, countError);
            activeCount = 0;
          }

          return {
            ...session,
            created_by_name: session.users?.full_name || 'Unknown User',
            current_active_employees: activeCount
          };
        })
      );

      setSessions(sessionsWithDetails);
    } catch (error) {
      console.error('Error fetching import history:', error);
      toast.error('Failed to load import history');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (session: ImportSession) => {
    try {
      // Try to fetch detailed employee information for this session
      // First check if import_session_id field exists, otherwise use alternative method
      let employees: any[] = [];
      
      try {
        const { data, error } = await supabase
          .from('employees')
          .select(`
            id, 
            is_active,
            users!inner(full_name, email)
          `)
          .eq('import_session_id', session.id);

        if (error) {
          // If the query fails due to missing column, try alternative approach
          if (error.message?.includes('import_session_id') || error.code === '42703') {
            console.warn('import_session_id column not found, using alternative method');
            
            // Get employees created by this session from session items
            const { data: sessionItems, error: itemsError } = await supabase
              .from('st_import_session_items')
              .select(`
                employee_id,
                employee_name,
                employee_email,
                employees!inner(id, is_active, users!inner(full_name, email))
              `)
              .eq('import_session_id', session.id)
              .not('employee_id', 'is', null);

            if (itemsError) throw itemsError;
            
            employees = sessionItems?.map(item => ({
              id: item.employees?.id || item.employee_id,
              name: item.employees?.users?.full_name || item.employee_name,
              email: item.employees?.users?.email || item.employee_email,
              is_active: item.employees?.is_active ?? true
            })) || [];
          } else {
            throw error;
          }
        } else {
          employees = (data || []).map(emp => ({
            id: emp.id,
            name: emp.users?.full_name || 'Unknown',
            email: emp.users?.email || 'No email',
            is_active: emp.is_active
          }));
        }
      } catch (queryError) {
        console.error('Failed to fetch employees, showing session items only:', queryError);
        
        // Fallback: show session items data
        const { data: sessionItems, error: itemsError } = await supabase
          .from('st_import_session_items')
          .select('id, employee_name, employee_email, status')
          .eq('import_session_id', session.id);

        if (itemsError) throw itemsError;
        
        employees = sessionItems?.map(item => ({
          id: item.id,
          name: item.employee_name || 'Unknown',
          email: item.employee_email || 'Unknown',
          is_active: item.status === 'completed'
        })) || [];
      }

      // Update the session with batch details
      const sessionWithDetails = {
        ...session,
        batch_details: {
          added_employees: employees
        }
      };

      setSelectedSession(sessionWithDetails);
      setShowDetails(true);
    } catch (error) {
      console.error('Error loading session details:', error);
      toast.error('Failed to load session details');
    }
  };

  const handleRestore = async () => {
    if (!selectedSession) return;

    try {
      // Try to restore using import_session_id, fallback to employee_id lookup
      let updateResult;
      
      try {
        updateResult = await supabase
          .from('employees')
          .update({ is_active: true })
          .eq('import_session_id', selectedSession.id);
          
        if (updateResult.error) {
          // If the query fails due to missing column, use alternative approach
          if (updateResult.error.message?.includes('import_session_id') || updateResult.error.code === '42703') {
            console.warn('import_session_id column not found, using alternative restore method');
            
            // Get employee IDs from session items and restore individually
            const { data: sessionItems, error: itemsError } = await supabase
              .from('st_import_session_items')
              .select('employee_id')
              .eq('import_session_id', selectedSession.id)
              .not('employee_id', 'is', null);

            if (itemsError) throw itemsError;
            
            const employeeIds = sessionItems?.map(item => item.employee_id).filter(Boolean) || [];
            
            if (employeeIds.length > 0) {
              const { error: restoreError } = await supabase
                .from('employees')
                .update({ is_active: true })
                .in('user_id', employeeIds);
                
              if (restoreError) throw restoreError;
            }
            
            updateResult = { error: null };
          } else {
            throw updateResult.error;
          }
        }
      } catch (restoreError) {
        throw restoreError;
      }

      if (updateResult.error) throw updateResult.error;

      toast.success(`Restored employees from batch`);
      fetchImportHistory();
      if (onRestore) onRestore(selectedSession.id);
    } catch (error) {
      console.error('Error restoring batch:', error);
      toast.error('Failed to restore batch');
    } finally {
      setShowRestoreDialog(false);
      setSelectedSession(null);
    }
  };

  const getStatusBadge = (session: ImportSession) => {
    if (session.failed > 0) {
      return <Badge variant="destructive">Failed: {session.failed}</Badge>;
    }
    if (session.current_active_employees < session.successful) {
      return <Badge variant="secondary">Partially Active</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-100 animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Import History
          </CardTitle>
          <CardDescription>
            View and restore previous employee import batches
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No import history found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Imported By</TableHead>
                    <TableHead>Employees</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        {session.created_at 
                          ? formatDistanceToNow(new Date(session.created_at), { addSuffix: true })
                          : '-'
                        }
                      </TableCell>
                      <TableCell>{session.created_by_name || 'Unknown'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span>{session.successful}</span>
                          {session.failed > 0 && (
                            <span className="text-red-600">({session.failed} failed)</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(session)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {session.spreadsheet_mode ? 'Spreadsheet' : 'CSV'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(session)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {session.current_active_employees < session.successful && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedSession(session);
                                setShowRestoreDialog(true);
                              }}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <AlertDialog open={showDetails} onOpenChange={setShowDetails}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Batch Details</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedSession?.created_at 
                ? `Imported ${formatDistanceToNow(new Date(selectedSession.created_at), { addSuffix: true })}`
                : 'Import details'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedSession?.batch_details?.added_employees?.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell>{emp.name}</TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell>
                      {emp.is_active ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                )) || (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-gray-500">
                      No employee details available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Confirmation */}
      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Import Batch?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reactivate {selectedSession?.total_employees} employees from this import batch. 
              Deactivated employees will become active again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore}>
              Restore Batch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}