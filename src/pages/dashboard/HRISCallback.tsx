import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { HRISService } from '@/services/hrisService';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function HRISCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // company_id
    const provider = searchParams.get('provider') || 'unified_to';
    const error = searchParams.get('error');

    if (error) {
      toast.error(`HRIS connection failed: ${error}`);
      navigate('/dashboard/settings');
      return;
    }

    if (!code || !state) {
      toast.error('Invalid callback parameters');
      navigate('/dashboard/settings');
      return;
    }

    try {
      const success = await HRISService.handleOAuthCallback(state, code, provider);
      
      if (success) {
        toast.success('HRIS connected successfully!');
        // Start initial sync
        await HRISService.syncEmployees(state);
      } else {
        toast.error('Failed to connect HRIS');
      }
    } catch (err) {
      console.error('HRIS callback error:', err);
      toast.error('Failed to connect HRIS');
    } finally {
      navigate('/dashboard/settings');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-lg text-muted-foreground">Connecting your HRIS...</p>
      </div>
    </div>
  );
}