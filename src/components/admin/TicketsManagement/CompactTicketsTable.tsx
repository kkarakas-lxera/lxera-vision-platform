import React from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

interface CompactTicketsTableProps {
  tickets: TicketRecord[];
  onViewDetails?: (id: string) => void;
  limit?: number;
}

const CompactTicketsTable: React.FC<CompactTicketsTableProps> = ({
  tickets,
  onViewDetails,
  limit = 5
}) => {
  const displayTickets = tickets.slice(0, limit);

  const getStatusBadge = (status: TicketRecord['status']) => {
    const statusColors = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      qualified: 'bg-green-100 text-green-800',
      converted: 'bg-purple-100 text-purple-800',
      rejected: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={statusColors[status]}>
        {status}
      </Badge>
    );
  };

  const getTicketTypeIcon = (type: TicketType) => {
    const icons = {
      demo_request: '🎯',
      contact_sales: '💰',
      early_access: '🚀'
    };
    return icons[type];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-3">
      {displayTickets.length === 0 ? (
        <p className="text-center text-gray-500 py-4">No tickets found</p>
      ) : (
        displayTickets.map((ticket) => (
          <div
            key={ticket.id}
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{getTicketTypeIcon(ticket.ticket_type)}</span>
                  <h4 className="font-medium">
                    {ticket.first_name} {ticket.last_name}
                  </h4>
                  {getStatusBadge(ticket.status)}
                </div>
                <p className="text-sm text-gray-600">{ticket.company || ticket.email}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Submitted: {formatDate(ticket.submitted_at)}
                </p>
              </div>
              {onViewDetails && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(ticket.id)}
                  className="ml-2"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))
      )}
      
      {tickets.length > limit && (
        <p className="text-sm text-center text-gray-500">
          Showing {limit} of {tickets.length} tickets
        </p>
      )}
    </div>
  );
};

export default CompactTicketsTable;