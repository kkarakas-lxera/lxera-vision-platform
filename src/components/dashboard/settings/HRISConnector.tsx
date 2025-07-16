import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Link2, Unlink, RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { HRISService, HRISConnection } from '@/services/hrisService';
import { toast } from 'sonner';

interface HRISConnectorProps {
  companyId: string;
}

export function HRISConnector({ companyId }: HRISConnectorProps) {
  const [connection, setConnection] = useState<HRISConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchConnection();
  }, [companyId]);

  const fetchConnection = async () => {
    try {
      const conn = await HRISService.getConnection(companyId);
      setConnection(conn);
    } catch (error) {
      console.error('Error fetching HRIS connection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (provider: string) => {
    try {
      const authUrl = await HRISService.initiateOAuth(companyId, provider);
      window.location.href = authUrl;
    } catch (error) {
      toast.error('Failed to initiate HRIS connection');
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await HRISService.syncEmployees(companyId);
      toast.success('Employee sync completed successfully');
      await fetchConnection();
    } catch (error) {
      toast.error('Failed to sync employees');
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    if (confirm('Are you sure you want to disconnect your HRIS? This will stop automatic employee syncing.')) {
      try {
        await HRISService.disconnectHRIS(companyId);
        setConnection(null);
        toast.success('HRIS disconnected successfully');
      } catch (error) {
        toast.error('Failed to disconnect HRIS');
      }
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const getSyncStatusBadge = () => {
    if (!connection) return null;
    
    switch (connection.syncStatus) {
      case 'syncing':
        return <Badge variant="default" className="bg-blue-600"><Clock className="h-3 w-3 mr-1" />Syncing</Badge>;
      case 'error':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Error</Badge>;
      default:
        return <Badge variant="secondary"><CheckCircle className="h-3 w-3 mr-1" />Connected</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>HRIS Integration</CardTitle>
        <CardDescription>
          Connect your HR system to automatically sync employee data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {connection ? (
          <>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium capitalize">{connection.provider} Connected</p>
                <p className="text-sm text-muted-foreground">
                  Last synced: {connection.lastSyncAt ? new Date(connection.lastSyncAt).toLocaleString() : 'Never'}
                </p>
                {connection.syncError && (
                  <p className="text-sm text-red-600 mt-1">{connection.syncError}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {getSyncStatusBadge()}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSync}
                  disabled={syncing || connection.syncStatus === 'syncing'}
                >
                  {syncing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Sync Now
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDisconnect}
                >
                  <Unlink className="h-4 w-4" />
                  Disconnect
                </Button>
              </div>
            </div>
            
            <Alert>
              <AlertDescription>
                Your HRIS is connected and will automatically sync employee data daily. 
                You can also manually sync at any time.
              </AlertDescription>
            </Alert>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Choose your HR system to enable automatic employee data synchronization
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-auto py-4 px-6 flex flex-col items-center gap-2"
                onClick={() => handleConnect('bamboohr')}
              >
                <Link2 className="h-5 w-5" />
                <span>BambooHR</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto py-4 px-6 flex flex-col items-center gap-2"
                onClick={() => handleConnect('workday')}
              >
                <Link2 className="h-5 w-5" />
                <span>Workday</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto py-4 px-6 flex flex-col items-center gap-2"
                onClick={() => handleConnect('adp')}
              >
                <Link2 className="h-5 w-5" />
                <span>ADP</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto py-4 px-6 flex flex-col items-center gap-2"
                onClick={() => handleConnect('unified_to')}
              >
                <Link2 className="h-5 w-5" />
                <span>Other (via Unified)</span>
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}