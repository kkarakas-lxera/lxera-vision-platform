import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Search, Filter, Download, RefreshCw } from 'lucide-react';
import TicketDetailModal from '@/components/admin/TicketsManagement/TicketDetailModal';
import TicketsTable from '@/components/admin/TicketsManagement/TicketsTable';
import TicketStats from '@/components/admin/TicketsManagement/TicketStats';
import { format } from 'date-fns';
import { ticketService, TicketRecord, TicketType, TicketStats as TicketStatsType } from '@/services/ticketService';

const Tickets = () => {
  const [tickets, setTickets] = useState<TicketRecord[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<TicketRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState<TicketType | 'all'>('all');
  const [selectedTicket, setSelectedTicket] = useState<TicketRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState<TicketStatsType>({
    total: 0,
    new: 0,
    byType: {
      demo_request: 0,
      contact_sales: 0,
      early_access: 0
    }
  });

  useEffect(() => {
    fetchTickets();
    fetchStats();
  }, []);

  useEffect(() => {
    filterTickets();
  }, [tickets, searchTerm, statusFilter, typeFilter]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await ticketService.getAllTickets();
      setTickets(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await ticketService.getTicketStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filterTickets = () => {
    let filtered = [...tickets];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(ticket => 
        ticket.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ticket.company && ticket.company.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.ticket_type === typeFilter);
    }

    setFilteredTickets(filtered);
  };

  const handleViewDetails = (ticketId: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket) {
      setSelectedTicket(ticket);
      setIsModalOpen(true);
    }
  };

  const handleStatusUpdate = async () => {
    await fetchTickets();
    await fetchStats();
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Type', 'First Name', 'Last Name', 'Email', 'Company', 'Status', 'Priority', 'Submitted At', 'Message'],
      ...filteredTickets.map(ticket => [
        ticket.ticket_type,
        ticket.first_name,
        ticket.last_name,
        ticket.email,
        ticket.company || '',
        ticket.status,
        ticket.priority,
        format(new Date(ticket.submitted_at), 'yyyy-MM-dd HH:mm'),
        ticket.message || ''
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tickets-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Tickets exported successfully');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Customer Tickets</h1>
          <p className="text-muted-foreground mt-1">Manage all customer interactions in one place</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {
            fetchTickets();
            fetchStats();
          }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <TicketStats stats={stats} />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tickets ({filteredTickets.length})</CardTitle>
          <CardDescription>Click on a ticket to view details and update status</CardDescription>
        </CardHeader>
        <CardContent>
          <TicketsTable
            tickets={filteredTickets}
            onViewDetails={handleViewDetails}
            selectedType={typeFilter}
            onTypeChange={setTypeFilter}
          />
        </CardContent>
      </Card>

      {/* Ticket Detail Modal */}
      <TicketDetailModal
        ticket={selectedTicket}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTicket(null);
        }}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
};

export default Tickets;