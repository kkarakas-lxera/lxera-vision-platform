import React from 'react';
import { TicketRecord, TicketType } from '@/services/ticketService';
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