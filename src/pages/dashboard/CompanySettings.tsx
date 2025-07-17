import { useState, useEffect } from 'react';
import { Settings, Link2, Building2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { HRISService } from '@/services/hrisService';
import { toast } from 'sonner';
import { getCompanyPermissions, type CompanyPermissions } from '@/utils/permissions';

export default function CompanySettings() {
  const { userProfile } = useAuth();
  const [hrisConnection, setHrisConnection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);
  const [permissions, setPermissions] = useState<CompanyPermissions | null>(null);

  useEffect(() => {
    checkHRISConnection();
    fetchPermissions();
  }, [userProfile?.company_id]);

  const fetchPermissions = async () => {
    if (userProfile?.company_id) {
      const companyPermissions = await getCompanyPermissions(userProfile.company_id);
      setPermissions(companyPermissions);
    }
  };

  const checkHRISConnection = async () => {
    if (!userProfile?.company_id) return;
    
    setLoading(true);
    try {
      const connection = await HRISService.getConnection(userProfile.company_id);
      setHrisConnection(connection);
    } catch (error) {
      console.error('Error checking HRIS connection:', error);
    } finally {
      setLoading(false);
    }
  };

  const disconnectHRIS = async () => {
    if (!userProfile?.company_id || !hrisConnection) return;
    
    setDisconnecting(true);
    try {
      await HRISService.disconnect(userProfile.company_id);
      setHrisConnection(null);
      toast.success('HRIS disconnected successfully');
    } catch (error) {
      console.error('Error disconnecting HRIS:', error);
      toast.error('Failed to disconnect HRIS');
    } finally {
      setDisconnecting(false);
    }
  };

  const connectHRIS = async (provider: string) => {
    try {
      const authUrl = await HRISService.initiateConnection(userProfile?.company_id!, provider);
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error connecting HRIS:', error);
      toast.error('Failed to connect HRIS');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-gray-600" />
        <h1 className="text-2xl font-bold">Company Settings</h1>
      </div>

      {/* HRIS Integration Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            HR System Integration
          </CardTitle>
          <CardDescription>
            Connect your HR Information System for automated employee data synchronization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-gray-200 rounded w-full"></div>
              <div className="h-20 bg-gray-200 rounded w-full"></div>
            </div>
          ) : hrisConnection ? (
            <div className="space-y-4">
              <Alert className="bg-white">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle>Connected to {hrisConnection.provider}</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>Your HR system is connected and syncing employee data.</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-green-700">
                      Active
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Connected on {new Date(hrisConnection.connected_at).toLocaleDateString()}
                    </span>
                  </div>
                </AlertDescription>
              </Alert>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Building2 className="h-8 w-8 text-gray-600" />
                  <div>
                    <p className="font-medium">{hrisConnection.provider}</p>
                    <p className="text-sm text-muted-foreground">
                      Last synced: {hrisConnection.last_sync ? new Date(hrisConnection.last_sync).toLocaleString() : 'Never'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={checkHRISConnection}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={disconnectHRIS}
                    disabled={disconnecting}
                  >
                    Disconnect
                  </Button>
                </div>
              </div>

              {hrisConnection.sync_status && (
                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <h4 className="font-medium text-sm">Sync Status</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Employees synced:</span>
                      <span className="ml-2 font-medium">{hrisConnection.sync_status.employees_synced || 0}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last error:</span>
                      <span className="ml-2 font-medium">{hrisConnection.sync_status.last_error || 'None'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <Alert className="bg-white">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No HR System Connected</AlertTitle>
                <AlertDescription>
                  Connect your HRIS to enable automated employee onboarding and data synchronization.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-24 flex flex-col items-center justify-center gap-2"
                  onClick={() => connectHRIS('bamboohr')}
                >
                  <Building2 className="h-8 w-8" />
                  <span>BambooHR</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex flex-col items-center justify-center gap-2"
                  onClick={() => connectHRIS('workday')}
                >
                  <Building2 className="h-8 w-8" />
                  <span>Workday</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex flex-col items-center justify-center gap-2"
                  onClick={() => connectHRIS('adp')}
                >
                  <Building2 className="h-8 w-8" />
                  <span>ADP</span>
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground text-center">
                Don't see your HRIS? Contact support for custom integrations.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan & Billing Section */}
      {permissions?.isSkillsGapUser && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Plan & Usage
            </CardTitle>
            <CardDescription>
              Manage your subscription and usage limits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <div>
                  <h3 className="font-medium text-blue-900">Skills Gap Analysis Trial</h3>
                  <p className="text-sm text-blue-700">
                    You're currently on a free trial with limited features
                  </p>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Free Trial
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Employee Limit</h4>
                  <p className="text-2xl font-bold text-green-600">{permissions.maxEmployees}</p>
                  <p className="text-sm text-muted-foreground">employees maximum</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Course Generation</h4>
                  <p className="text-2xl font-bold text-orange-600">Locked</p>
                  <p className="text-sm text-muted-foreground">upgrade to unlock</p>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Ready to unlock full features?</AlertTitle>
                <AlertDescription>
                  Upgrade to access unlimited employees, AI course generation, advanced analytics, and more.
                </AlertDescription>
              </Alert>

              <div className="flex items-center gap-2">
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Upgrade Plan
                </Button>
                <Button variant="outline" size="sm">
                  Contact Sales
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Other Settings Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Other company settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Additional settings will be available here including company profile, billing, notifications, and more.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}