import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Send, Mail, CheckCircle, Eye, RefreshCw, Users, AlertTriangle, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

interface Employee {
  id: string;
  full_name: string;
  email: string;
  position?: string | null;
  cv_file_path?: string | null;
  invitation_status?: 'not_sent' | 'sent' | 'viewed' | 'completed';
  invitation_sent_at?: string | null;
}

interface InvitationManagementProps {
  employees: Employee[];
  onInvitationsSent?: () => void;
}

export function InvitationManagement({ employees, onInvitationsSent }: InvitationManagementProps) {
  const { userProfile } = useAuth();
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [uploadingCVs, setUploadingCVs] = useState(false);
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
      notSent: employees.filter(e => e.invitation_status === 'not_sent').length,
      sent: employees.filter(e => e.invitation_status === 'sent').length,
      viewed: employees.filter(e => e.invitation_status === 'viewed').length,
      completed: employees.filter(e => e.invitation_status === 'completed').length
    };
    setInvitationStats(stats);
  };

  const eligibleForInvite = employees.filter(e => 
    e.invitation_status === 'not_sent' || e.invitation_status === 'sent'
  );

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
          employeeIds: selectedEmployees,
          companyId: userProfile?.company_id
        }
      });

      if (error) throw error;

      toast.success(`Successfully sent ${data.sentCount} invitations`);
      setSelectedEmployees([]);
      if (onInvitationsSent) onInvitationsSent();
    } catch (error) {
      console.error('Error sending invitations:', error);
      toast.error('Failed to send invitations');
    } finally {
      setSending(false);
    }
  };

  const handleBulkCVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingCVs(true);
    let successCount = 0;
    let failCount = 0;

    try {
      for (const file of Array.from(files)) {
        // Extract employee identifier from filename
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        const employee = employees.find(e => 
          e.full_name.toLowerCase().includes(nameWithoutExt.toLowerCase()) ||
          e.email.toLowerCase().includes(nameWithoutExt.toLowerCase())
        );

        if (!employee) {
          console.warn(`No matching employee found for ${file.name}`);
          failCount++;
          continue;
        }

        // Upload CV
        const filePath = `${employee.id}/${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('employee-cvs')
          .upload(filePath, file, { upsert: true });

        if (uploadError) {
          console.error(`Failed to upload CV for ${employee.full_name}:`, uploadError);
          failCount++;
          continue;
        }

        // Update employee record
        const { error: updateError } = await supabase
          .from('employees')
          .update({ 
            cv_file_path: filePath,
            cv_uploaded_at: new Date().toISOString()
          })
          .eq('id', employee.id);

        if (updateError) {
          console.error(`Failed to update employee record:`, updateError);
          failCount++;
        } else {
          successCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully uploaded ${successCount} CVs`);
        if (onInvitationsSent) onInvitationsSent(); // Refresh data
      }
      if (failCount > 0) {
        toast.error(`Failed to upload ${failCount} CVs`);
      }
    } catch (error) {
      console.error('Error uploading CVs:', error);
      toast.error('Failed to upload CVs');
    } finally {
      setUploadingCVs(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'viewed':
        return <Badge className="bg-blue-100 text-blue-800">Viewed</Badge>;
      case 'sent':
        return <Badge className="bg-yellow-100 text-yellow-800">Sent</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Not Sent</Badge>;
    }
  };

  const completionRate = Math.round((invitationStats.completed / employees.length) * 100) || 0;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Users className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Not Invited</p>
                <p className="text-2xl font-bold">{invitationStats.notSent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Send className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Sent</p>
                <p className="text-2xl font-bold">{invitationStats.sent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Viewed</p>
                <p className="text-2xl font-bold">{invitationStats.viewed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{invitationStats.completed}</p>
                <Progress value={completionRate} className="h-1 mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Send Invitations</CardTitle>
              <CardDescription>
                Invite employees to complete their profiles or upload CVs on their behalf
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <label htmlFor="cv-upload">
                <input
                  id="cv-upload"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleBulkCVUpload}
                  disabled={uploadingCVs}
                />
                <Button
                  variant="outline"
                  disabled={uploadingCVs}
                  asChild
                >
                  <span className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadingCVs ? 'Uploading...' : 'Upload CVs'}
                  </span>
                </Button>
              </label>
              <Button
                onClick={sendInvitations}
                disabled={selectedEmployees.length === 0 || sending}
              >
                <Send className="h-4 w-4 mr-2" />
                Send {selectedEmployees.length > 0 && `(${selectedEmployees.length})`}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {eligibleForInvite.length === 0 ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                All employees have either completed their profiles or have pending invitations.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedEmployees.length === eligibleForInvite.length && eligibleForInvite.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>CV Status</TableHead>
                    <TableHead>Invitation Status</TableHead>
                    <TableHead>Last Sent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eligibleForInvite.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedEmployees.includes(employee.id)}
                          onCheckedChange={(checked) => handleSelectEmployee(employee.id, !!checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{employee.full_name}</p>
                          <p className="text-sm text-gray-500">{employee.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{employee.position || '-'}</TableCell>
                      <TableCell>
                        {employee.cv_file_path ? (
                          <Badge className="bg-green-100 text-green-800">Uploaded</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">Not Uploaded</Badge>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(employee.invitation_status || 'not_sent')}</TableCell>
                      <TableCell>
                        {employee.invitation_sent_at
                          ? formatDistanceToNow(new Date(employee.invitation_sent_at), { addSuffix: true })
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Help Text */}
          <Alert className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Tip:</strong> Name CV files with employee names or emails for automatic matching during bulk upload.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}