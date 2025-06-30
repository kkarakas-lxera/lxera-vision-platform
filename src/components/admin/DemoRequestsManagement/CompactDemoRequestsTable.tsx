
import React from 'react';
import { DemoRequestRecord } from '@/services/demoRequestService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CompactDemoRequestsTableProps {
  requests: DemoRequestRecord[];
  onViewDetails: (id: string) => void;
}

const CompactDemoRequestsTable: React.FC<CompactDemoRequestsTableProps> = ({
  requests,
  onViewDetails
}) => {
  const getStatusBadge = (status: string) => {
    const validStatus = status as 'new' | 'contacted' | 'qualified' | 'converted' | 'rejected';
    
    const statusColors = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      qualified: 'bg-green-100 text-green-800',
      converted: 'bg-purple-100 text-purple-800',
      rejected: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={statusColors[validStatus] || statusColors.new}>
        {validStatus}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div key={request.id} className="border rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold">
                {request.first_name} {request.last_name}
              </h3>
              <p className="text-sm text-gray-600">{request.company}</p>
              <p className="text-sm text-gray-600">{request.email}</p>
              {getStatusBadge(request.status)}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onViewDetails(request.id)}
            >
              View Details
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CompactDemoRequestsTable;
