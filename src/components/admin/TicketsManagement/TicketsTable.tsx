import React from 'react';
import { TicketRecord, TicketType } from '@/services/ticketService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TicketsTableProps {
  tickets: TicketRecord[];
  onViewDetails: (id: string) => void;
  selectedType: TicketType | 'all';
  onTypeChange: (type: TicketType | 'all') => void;
}

const TicketsTable: React.FC<TicketsTableProps> = ({
  tickets,
  onViewDetails,
  selectedType,
  onTypeChange
}) => {
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

  const getTicketTypeLabel = (type: TicketType) => {
    const labels = {
      demo_request: 'Demo Request',
      contact_sales: 'Sales Contact',
      early_access: 'Early Access'
    };
    return labels[type];
  };

  const getPriorityBadge = (priority: TicketRecord['priority']) => {
    const priorityColors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={priorityColors[priority]}>
        {priority}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <Select value={selectedType} onValueChange={(value) => onTypeChange(value as TicketType | 'all')}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tickets</SelectItem>
            <SelectItem value="demo_request">
              <span className="flex items-center gap-2">
                🎯 Demo Requests
              </span>
            </SelectItem>
            <SelectItem value="contact_sales">
              <span className="flex items-center gap-2">
                💰 Sales Contacts
              </span>
            </SelectItem>
            <SelectItem value="early_access">
              <span className="flex items-center gap-2">
                🚀 Early Access
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full border-collapse bg-white">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Company</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Priority</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Submitted</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  No tickets found
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr key={ticket.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getTicketTypeIcon(ticket.ticket_type)}</span>
                      <span className="text-sm text-gray-600">{getTicketTypeLabel(ticket.ticket_type)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">
                      {ticket.first_name} {ticket.last_name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {ticket.company || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <a href={`mailto:${ticket.email}`} className="text-blue-600 hover:underline">
                      {ticket.email}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(ticket.status)}
                  </td>
                  <td className="px-4 py-3">
                    {getPriorityBadge(ticket.priority)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDate(ticket.submitted_at)}
                  </td>
                  <td className="px-4 py-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onViewDetails(ticket.id)}
                    >
                      View Details
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TicketsTable;