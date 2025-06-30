
import React from 'react';
import { DemoRequestRecord } from '@/services/demoRequestService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DemoRequestsTableProps {
  requests: DemoRequestRecord[];
  onViewDetails: (id: string) => void;
}

const DemoRequestsTable: React.FC<DemoRequestsTableProps> = ({
  requests,
  onViewDetails
}) => {
  const getStatusBadge = (status: DemoRequestRecord['status']) => {
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

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Company</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id}>
              <td className="border border-gray-300 px-4 py-2">
                {request.first_name} {request.last_name}
              </td>
              <td className="border border-gray-300 px-4 py-2">{request.company}</td>
              <td className="border border-gray-300 px-4 py-2">{request.email}</td>
              <td className="border border-gray-300 px-4 py-2">
                {getStatusBadge(request.status)}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onViewDetails(request.id)}
                >
                  View Details
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DemoRequestsTable;
