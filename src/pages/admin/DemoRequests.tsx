
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import CompactDemoRequestsTable from "@/components/admin/DemoRequestsManagement/CompactDemoRequestsTable";

interface DemoRequest {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company: string;
  status: string;
  created_at: string;
}

const DemoRequests = () => {
  const [requests, setRequests] = useState<DemoRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDemoRequests();
  }, []);

  const fetchDemoRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('demo_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching demo requests:', error);
      toast.error('Failed to load demo requests');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (id: string) => {
    console.log('View details for:', id);
    // TODO: Navigate to details view or open modal
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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Demo Requests</h1>
        <p className="text-muted-foreground">Manage and track demo requests from potential customers</p>
      </div>
      
      <CompactDemoRequestsTable 
        requests={requests}
        onViewDetails={handleViewDetails}
      />
    </div>
  );
};

export default DemoRequests;
