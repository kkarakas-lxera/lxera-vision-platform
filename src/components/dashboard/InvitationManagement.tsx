import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Send, Mail, CheckCircle, Eye, RefreshCw, Users, AlertTriangle, Clock, ArrowRight, Filter, RotateCw, MoreVertical, X, MousePointer, History } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface Employee {
  id: string;
  full_name: string;
  email: string;
  position?: string | null;
  invitation_status?: 'not_sent' | 'sent' | 'viewed' | 'completed';
  invitation_sent_at?: string | null;
  email_opened_at?: string | null;
  email_opened_count?: number;
  email_clicked_at?: string | null;
  email_clicked_count?: number;
  email_clicks?: Array<{
    link: string;
    timestamp: string;
    ipAddress?: string;
    userAgent?: string;
  }>;
}

interface InvitationManagementProps {
  employees: Employee[];
  onInvitationsSent?: () => void;
}

export function InvitationManagement({ employees, onInvitationsSent }: InvitationManagementProps) {
  const { userProfile } = useAuth();
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'not_sent' | 'sent' | 'viewed' | 'completed'>('all');
  const [sendingReminders, setSendingReminders] = useState<string[]>([]);
  const [showReminderBanner, setShowReminderBanner] = useState(true);
  const [invitationStats, setInvitationStats] = useState({
    notSent: 0,
    sent: 0,
    viewed: 0,
    completed: 0
  });

  useEffect(() => {
    calculateStats();
  }, [employees]);

  const calculateStats = () => {
    const stats = {
      notSent: employees.filter(e => e.invitation_status === 'not_sent' || !e.invitation_status).length,
      sent: employees.filter(e => e.invitation_status === 'sent').length,
      viewed: employees.filter(e => e.invitation_status === 'viewed').length,
      completed: employees.filter(e => e.invitation_status === 'completed').length
    };
    setInvitationStats(stats);
  };

  // Filter employees based on status
  const filteredEmployees = employees.filter(e => {
    if (statusFilter === 'all') return true;
    return e.invitation_status === statusFilter || (statusFilter === 'not_sent' && !e.invitation_status);
  });

  const eligibleForInvite = filteredEmployees.filter(e => 
    e.invitation_status === 'not_sent' || e.invitation_status === 'sent' || !e.invitation_status
  );

  const viewedButNotCompleted = employees.filter(e => e.invitation_status === 'viewed');

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmployees(eligibleForInvite.map(e => e.id));
    } else {
      setSelectedEmployees([]);
    }
  };

  const handleSelectEmployee = (employeeId: string, checked: boolean) => {
    if (checked) {
      setSelectedEmployees([...selectedEmployees, employeeId]);
    } else {
      setSelectedEmployees(selectedEmployees.filter(id => id !== employeeId));
    }
  };

  const sendInvitations = async () => {
    if (selectedEmployees.length === 0) {
      toast.error('Please select at least one employee');
      return;
    }

    setSending(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-profile-invitations', {
        body: {
          employee_ids: selectedEmployees,
          company_id: userProfile?.company_id
        }
      });

      if (error) throw error;

      toast.success(`Successfully sent ${data.sent} invitations`);
      setSelectedEmployees([]);
      if (onInvitationsSent) onInvitationsSent();
    } catch (error) {
      console.error('Error sending invitations:', error);
      toast.error('Failed to send invitations');
    } finally {
      setSending(false);
    }
  };

  const sendReminder = async (employeeId: string) => {
    setSendingReminders([...sendingReminders, employeeId]);
    
    try {
      const { error } = await supabase.functions.invoke('send-profile-invitations', {
        body: {
          employee_ids: [employeeId],
          company_id: userProfile?.company_id,
          isReminder: true
        }
      });

      if (error) throw error;

      toast.success('Reminder sent successfully');
      if (onInvitationsSent) onInvitationsSent();
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast.error('Failed to send reminder');
    } finally {
      setSendingReminders(sendingReminders.filter(id => id !== employeeId));
    }
  };

  const sendAllInvitations = async () => {
    const notInvitedEmployees = employees
      .filter(e => e.invitation_status === 'not_sent' || !e.invitation_status)
      .map(e => e.id);
    
    if (notInvitedEmployees.length === 0) {
      toast.error('No employees to invite');
      return;
    }

    setSelectedEmployees(notInvitedEmployees);
    await sendInvitations();
  };


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <div className="flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">Completed</span>
          </div>
        );
      case 'viewed':
        return (
          <div className="flex items-center gap-1.5">
            <Eye className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Viewed</span>
          </div>
        );
      case 'sent':
        return (
          <div className="flex items-center gap-1.5">
            <Mail className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-700">Sent</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-600">Not Sent</span>
          </div>
        );
    }
  };

  // Get the right action button text based on selected employees
  const getActionButtonText = () => {
    if (selectedEmployees.length === 0) return 'Select employees';
    
    const selectedStatuses = selectedEmployees.map(id => 
      employees.find(e => e.id === id)?.invitation_status || 'not_sent'
    );
    
    const hasViewed = selectedStatuses.includes('viewed');
    const hasSent = selectedStatuses.includes('sent');
    
    if (hasViewed || hasSent) {
      return `Send Reminder${selectedEmployees.length > 1 ? 's' : ''}`;
    }
    return `Send Invitation${selectedEmployees.length > 1 ? 's' : ''}`;
  };

  const completionRate = Math.round((invitationStats.completed / employees.length) * 100) || 0;

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Card 
                className={cn(
                  "cursor-pointer hover:shadow-md transition-all duration-200 border-2",
                  statusFilter === 'not_sent' ? "border-gray-400 shadow-md" : "border-transparent"
                )}
                onClick={() => setStatusFilter('not_sent')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Users className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-600">Not Invited</p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-2xl font-bold">{invitationStats.notSent}</p>
                          <span className="text-sm text-gray-500">/ {employees.length}</span>
                        </div>
                        {employees.length > 0 && (
                          <Progress 
                            value={(invitationStats.notSent / employees.length) * 100} 
                            className="h-1 w-20" 
                          />
                        )}
                      </div>
                    </div>
                    {invitationStats.notSent > 0 && (
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Employees added but not contacted yet</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card 
                className={cn(
                  "cursor-pointer hover:shadow-md transition-all duration-200 border-2",
                  statusFilter === 'sent' ? "border-yellow-400 shadow-md" : "border-transparent"
                )}
                onClick={() => setStatusFilter('sent')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Send className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-600">Sent</p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-2xl font-bold">{invitationStats.sent}</p>
                          <span className="text-sm text-gray-500">/ {employees.length}</span>
                        </div>
                        {employees.length > 0 && (
                          <Progress 
                            value={(invitationStats.sent / employees.length) * 100} 
                            className="h-1 w-20" 
                          />
                        )}
                      </div>
                    </div>
                    {invitationStats.sent > 0 && (
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Invitations sent but not yet opened</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card 
                className={cn(
                  "cursor-pointer hover:shadow-md transition-all duration-200 border-2",
                  statusFilter === 'viewed' ? "border-blue-400 shadow-md" : "border-transparent"
                )}
                onClick={() => setStatusFilter('viewed')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Eye className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-600">Viewed</p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-2xl font-bold">{invitationStats.viewed}</p>
                          <span className="text-sm text-gray-500">/ {employees.length}</span>
                        </div>
                        {employees.length > 0 && (
                          <Progress 
                            value={(invitationStats.viewed / employees.length) * 100} 
                            className="h-1 w-20" 
                          />
                        )}
                      </div>
                    </div>
                    {invitationStats.viewed > 0 && (
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Invitation opened but profile not completed</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card 
                className={cn(
                  "cursor-pointer hover:shadow-md transition-all duration-200 border-2",
                  statusFilter === 'completed' ? "border-green-400 shadow-md" : "border-transparent"
                )}
                onClick={() => setStatusFilter('completed')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-600">Completed</p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-2xl font-bold">{invitationStats.completed}</p>
                          <span className="text-sm text-gray-500">/ {employees.length}</span>
                        </div>
                        {employees.length > 0 && (
                          <Progress 
                            value={completionRate} 
                            className="h-1 w-20" 
                          />
                        )}
                      </div>
                    </div>
                    {invitationStats.completed > 0 && (
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Profile setup completed ({completionRate}%)</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Reminder Alert for Viewed but Not Completed */}
        {viewedButNotCompleted.length > 0 && showReminderBanner && (
          <Alert className="bg-blue-50 border-blue-200 relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={() => setShowReminderBanner(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <RotateCw className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between pr-8">
              <span>
                <strong>{viewedButNotCompleted.length}</strong> employee{viewedButNotCompleted.length > 1 ? 's' : ''} viewed but haven't completed their profile
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStatusFilter('viewed')}
                className="ml-4"
              >
                View & Send Reminders
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Employee Invitations</CardTitle>
                <CardDescription>
                  Manage and send profile completion invitations
                </CardDescription>
              </div>
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  <SelectItem value="not_sent">Not Invited</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="viewed">Viewed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {/* Empty State */}
            {employees.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No employees imported yet</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Import employees first to start sending invitations
                </p>
              </div>
            ) : eligibleForInvite.length === 0 && statusFilter === 'all' ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  All employees have either completed their profiles or have pending invitations.
                </AlertDescription>
              </Alert>
            ) : filteredEmployees.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No employees found with status: {statusFilter.replace('_', ' ')}
              </div>
            ) : (
              <div className="space-y-4 relative">
                {/* Sticky Bulk Action Bar */}
                {selectedEmployees.length > 0 && (
                  <div className="sticky top-0 z-10 bg-white border rounded-lg shadow-lg p-4 mb-4 animate-in slide-in-from-top-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Checkbox
                          checked={selectedEmployees.length === eligibleForInvite.length && eligibleForInvite.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                        <span className="text-sm font-medium">
                          {selectedEmployees.length} employee{selectedEmployees.length > 1 ? 's' : ''} selected
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedEmployees([])}
                        >
                          Clear selection
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={sendInvitations}
                          disabled={sending}
                          className="min-w-[140px]"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          {getActionButtonText()} ({selectedEmployees.length})
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {statusFilter !== 'completed' && (
                          <TableHead className="w-12">
                            {eligibleForInvite.length > 0 && (
                              <Checkbox
                                checked={selectedEmployees.length === eligibleForInvite.length && eligibleForInvite.length > 0}
                                onCheckedChange={handleSelectAll}
                              />
                            )}
                          </TableHead>
                        )}
                        <TableHead className="min-w-[250px]">Employee</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead colSpan={2} className="text-center">Engagement</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEmployees.map((employee) => {
                        const canSelect = statusFilter !== 'completed' && 
                          (employee.invitation_status === 'not_sent' || employee.invitation_status === 'sent' || !employee.invitation_status);
                        
                        return (
                          <TableRow 
                            key={employee.id}
                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            {statusFilter !== 'completed' && (
                              <TableCell>
                                {canSelect && (
                                  <Checkbox
                                    checked={selectedEmployees.includes(employee.id)}
                                    onCheckedChange={(checked) => handleSelectEmployee(employee.id, !!checked)}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                )}
                              </TableCell>
                            )}
                            <TableCell>
                              <div className="space-y-1">
                                <p className="font-medium text-gray-900">{employee.full_name}</p>
                                <p className="text-sm text-gray-500">{employee.email}</p>
                                {employee.position && (
                                  <p className="text-xs text-gray-400">{employee.position}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(employee.invitation_status || 'not_sent')}</TableCell>
                            <TableCell className="text-center">
                              <div className="space-y-1">
                                {employee.email_opened_count > 0 && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center justify-center gap-1 text-sm">
                                        <Eye className="h-3 w-3 text-blue-600" />
                                        <span className="text-gray-600">
                                          {employee.email_opened_count}x
                                        </span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Email opened {employee.email_opened_count} time{employee.email_opened_count > 1 ? 's' : ''}</p>
                                      <p className="text-xs text-gray-500">
                                        First: {employee.email_opened_at 
                                          ? formatDistanceToNow(new Date(employee.email_opened_at), { addSuffix: true })
                                          : 'recently'}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                                {employee.email_clicked_count > 0 && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center justify-center gap-1 text-sm">
                                        <MousePointer className="h-3 w-3 text-green-600" />
                                        <span className="text-gray-600">
                                          {employee.email_clicked_count}x
                                        </span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Invitation link clicked {employee.email_clicked_count} time{employee.email_clicked_count > 1 ? 's' : ''}</p>
                                      <p className="text-xs text-gray-500 mt-1">No profile started yet</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                                {employee.invitation_status === 'sent' && 
                                 employee.email_opened_count === 0 && (
                                  <span className="text-xs text-gray-400">Not opened</span>
                                )}
                                {employee.invitation_status === 'not_sent' && (
                                  <span className="text-xs text-gray-400">-</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-sm text-gray-500 cursor-help">
                                    {employee.invitation_sent_at
                                      ? formatDistanceToNow(new Date(employee.invitation_sent_at), { addSuffix: true })
                                      : '-'}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {employee.invitation_sent_at ? (
                                    <p>Sent on {new Date(employee.invitation_sent_at).toLocaleString()}</p>
                                  ) : (
                                    <p>No invitation sent yet</p>
                                  )}
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  {employee.invitation_status === 'viewed' && (
                                    <DropdownMenuItem 
                                      onClick={() => sendReminder(employee.id)}
                                      disabled={sendingReminders.includes(employee.id)}
                                    >
                                      <RotateCw className="h-4 w-4 mr-2" />
                                      Send Reminder
                                    </DropdownMenuItem>
                                  )}
                                  {(employee.invitation_status === 'sent' || employee.invitation_status === 'viewed') && (
                                    <DropdownMenuItem 
                                      onClick={() => sendReminder(employee.id)}
                                      disabled={sendingReminders.includes(employee.id)}
                                    >
                                      <Mail className="h-4 w-4 mr-2" />
                                      Resend Invitation
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem>
                                    <History className="h-4 w-4 mr-2" />
                                    View Timeline
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}