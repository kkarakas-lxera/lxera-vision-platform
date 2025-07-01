import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Building,
  Mail,
  Phone,
  User,
  Calendar,
  Globe,
  MessageSquare,
  FileText,
  Users
} from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DemoRequestDetailModalProps {
  request: any;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: () => void;
}

const DemoRequestDetailModal: React.FC<DemoRequestDetailModalProps> = ({
  request,
  isOpen,
  onClose,
  onStatusUpdate
}) => {
  const [status, setStatus] = React.useState(request?.status || 'new');
  const [notes, setNotes] = React.useState(request?.notes || '');
  const [isUpdating, setIsUpdating] = React.useState(false);

  React.useEffect(() => {
    if (request) {
      setStatus(request.status);
      setNotes(request.notes || '');
    }
  }, [request]);

  const handleUpdate = async () => {
    if (!request) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('demo_requests')
        .update({
          status,
          notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', request.id);

      if (error) throw error;

      toast.success('Demo request updated successfully');
      onStatusUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating demo request:', error);
      toast.error('Failed to update demo request');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    const colors = {
      new: 'default',
      contacted: 'secondary',
      qualified: 'success',
      converted: 'success',
      rejected: 'destructive'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  if (!request) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Demo Request Details</DialogTitle>
          <DialogDescription>
            View and manage demo request information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contact Information */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Contact Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {request.first_name} {request.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">{request.job_title || 'No title'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Building className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{request.company}</p>
                  <p className="text-sm text-muted-foreground">
                    {request.company_size ? `${request.company_size} employees` : 'Size unknown'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${request.email}`} className="text-sm text-primary hover:underline">
                  {request.email}
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">{request.phone || 'No phone'}</p>
              </div>

              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">{request.country || 'No country'}</p>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">
                  {format(new Date(request.created_at), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Message */}
          {request.message && (
            <>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Message
                </h3>
                <p className="text-sm bg-muted p-3 rounded-md">{request.message}</p>
              </div>
              <Separator />
            </>
          )}

          {/* Status Management */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Status Management
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Badge variant={getStatusBadgeColor(status) as any} className="h-fit">
                  {status}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Internal Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this demo request..."
                rows={4}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update Request'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DemoRequestDetailModal;