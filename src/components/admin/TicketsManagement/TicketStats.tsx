import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, DollarSign, Rocket, Clock } from "lucide-react";
import { TicketStats as TicketStatsType } from "@/services/ticketService";

interface TicketStatsProps {
  stats: TicketStatsType;
}

const TicketStats = ({ stats }: TicketStatsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            All customer interactions
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">New Tickets</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.new}</div>
          <p className="text-xs text-muted-foreground">
            Awaiting response
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Demo Requests</CardTitle>
          <span className="text-lg">🎯</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.byType.demo_request}</div>
          <p className="text-xs text-muted-foreground">
            Product demonstrations
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sales Contacts</CardTitle>
          <span className="text-lg">💰</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.byType.contact_sales}</div>
          <p className="text-xs text-muted-foreground">
            High priority leads
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Early Access</CardTitle>
          <span className="text-lg">🚀</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.byType.early_access}</div>
          <p className="text-xs text-muted-foreground">
            Waitlist signups
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketStats;