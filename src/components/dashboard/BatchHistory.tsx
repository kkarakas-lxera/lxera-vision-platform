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
  batch_details: {
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
      const { data, error } = await supabase
        .from('v_import_session_history')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching import history:', error);
      toast.error('Failed to load import history');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedSession) return;

    try {
      const { error } = await supabase
        .from('employees')
        .update({ is_active: true })
        .eq('import_session_id', selectedSession.id);

      if (error) throw error;

      toast.success(`Restored ${selectedSession.total_employees} employees from batch`);
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
                        {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
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
                            onClick={() => {
                              setSelectedSession(session);
                              setShowDetails(true);
                            }}
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
              Imported {formatDistanceToNow(new Date(selectedSession?.created_at || ''), { addSuffix: true })}
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
                {selectedSession?.batch_details.added_employees.map((emp) => (
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
                ))}
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