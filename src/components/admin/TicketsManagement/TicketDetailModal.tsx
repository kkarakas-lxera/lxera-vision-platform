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
  Users,
  Tag,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
// Types from removed ticketService
type TicketType = 'demo_request' | 'contact_sales' | 'early_access';

interface TicketRecord {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company: string;
  job_title: string | null;
  phone: string | null;
  company_size: string | null;
  country: string | null;
  message: string | null;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  notes: string | null;
  processed_by: string | null;
  processed_at: string | null;
  submitted_at: string;
  created_at: string;
  updated_at: string;
  ticket_type: TicketType;
  budget_range: string | null;
  timeline: string | null;
  use_case: string | null;
  referral_source: string | null;
}

interface TicketDetailModalProps {
  ticket: TicketRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: () => void;
}

const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticket,
  isOpen,
  onClose,
  onStatusUpdate
}) => {
  const [status, setStatus] = React.useState(ticket?.status || 'new');
  const [priority, setPriority] = React.useState(ticket?.priority || 'medium');
  const [notes, setNotes] = React.useState(ticket?.notes || '');
  const [isUpdating, setIsUpdating] = React.useState(false);

  React.useEffect(() => {
    if (ticket) {
      setStatus(ticket.status);
      setPriority(ticket.priority);
      setNotes(ticket.notes || '');
    }
  }, [ticket]);

  const handleUpdate = async () => {
    if (!ticket) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('tickets')
        .update({
          status,
          priority,
          notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticket.id);

      if (error) throw error;

      toast.success('Ticket updated successfully');
      onStatusUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast.error('Failed to update ticket');
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

  const getPriorityBadgeColor = (priority: string) => {
    const colors = {
      low: 'default',
      medium: 'secondary',
      high: 'destructive'
    };
    return colors[priority as keyof typeof colors] || 'default';
  };

  const getTicketTypeIcon = (type: TicketType) => {
    const icons = {
      demo_request: '🎯',
      contact_sales: '💰',
      early_access: '🚀'
    };
    return icons[type];
  };

  const getTicketTypeLabel = (type: TicketType) => {
    const labels = {
      demo_request: 'Demo Request',
      contact_sales: 'Sales Contact',
      early_access: 'Early Access'
    };
    return labels[type];
  };

  if (!ticket) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <span className="text-2xl">{getTicketTypeIcon(ticket.ticket_type)}</span>
            {getTicketTypeLabel(ticket.ticket_type)} Details
          </DialogTitle>
          <DialogDescription>
            View and manage ticket information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ticket Type and Priority */}
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {getTicketTypeLabel(ticket.ticket_type)}
            </Badge>
            <Badge variant={getPriorityBadgeColor(ticket.priority) as any}>
              <AlertCircle className="h-3 w-3 mr-1" />
              {ticket.priority} priority
            </Badge>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Contact Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {ticket.first_name} {ticket.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">{ticket.job_title || 'No title'}</p>
                </div>
              </div>
              
              {ticket.company && (
                <div className="flex items-center gap-3">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{ticket.company}</p>
                    <p className="text-sm text-muted-foreground">
                      {ticket.company_size ? `${ticket.company_size} employees` : 'Size unknown'}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${ticket.email}`} className="text-sm text-primary hover:underline">
                  {ticket.email}
                </a>
              </div>

              {ticket.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{ticket.phone}</p>
                </div>
              )}

              {ticket.country && (
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{ticket.country}</p>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">
                  {format(new Date(ticket.submitted_at), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Message */}
          {ticket.message && (
            <>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Message
                </h3>
                <p className="text-sm bg-muted p-3 rounded-md">{ticket.message}</p>
              </div>
              <Separator />
            </>
          )}

          {/* Additional Metadata */}
          {ticket.metadata && Object.keys(ticket.metadata).length > 0 && (
            <>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">Additional Information</h3>
                <div className="space-y-2">
                  {Object.entries(ticket.metadata).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-sm font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
                      <span className="text-sm text-muted-foreground">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Status Management */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Ticket Management
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

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Internal Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this ticket..."
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
              {isUpdating ? 'Updating...' : 'Update Ticket'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TicketDetailModal;