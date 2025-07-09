import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const EarlyAccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [leadData, setLeadData] = useState<any>(null);
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        toast({
          title: 'Invalid Link',
          description: 'No token provided. Please use the link from your email.',
          variant: 'destructive'
        });
        navigate('/');
        return;
      }

      try {
        // Verify magic link
        const response = await supabase.functions.invoke('verify-magic-link', {
          body: { token }
        });

        if (response.error) throw response.error;

        const data = response.data as any;

        if (data.success && data.lead) {
          setLeadData(data.lead);
          
          // Redirect to waiting room with token
          const waitingRoomUrl = `/waiting-room?email=${encodeURIComponent(data.lead.email)}&token=${token}`;
          
          // Small delay to show loading state
          setTimeout(() => {
            navigate(waitingRoomUrl);
          }, 1000);
        } else {
          throw new Error('Invalid token');
        }
      } catch (error: any) {
        console.error('Token verification error:', error);
        toast({
          title: 'Link Expired',
          description: 'This link has expired or already been used. Please request a new one.',
          variant: 'destructive'
        });
        navigate('/');
      }
    };

    verifyToken();
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <Loader2 className="h-12 w-12 animate-spin text-future-green mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Verifying your access...
          </h2>
          <p className="text-gray-600">
            We're redirecting you to complete your profile.
          </p>
          {leadData && (
            <p className="text-sm text-gray-500 mt-4">
              Welcome back, {leadData.email}!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EarlyAccess;