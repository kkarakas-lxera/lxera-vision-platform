import { useState, useEffect } from 'react';
import { Settings, Link2, Building2, CheckCircle, AlertCircle, RefreshCw, Zap, Users, Sparkles, CreditCard, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { HRISService } from '@/services/hrisService';
import { toast } from 'sonner';
import { getCompanyPermissions, type CompanyPermissions } from '@/utils/permissions';
import { Separator } from '@/components/ui/separator';

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
      const authUrl = await HRISService.initiateOAuth(userProfile?.company_id!, provider);
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error connecting HRIS:', error);
      toast.error('Failed to connect HRIS');
    }
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your company settings and integrations</p>
      </div>

      <div className="space-y-4">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-gray-500" />
              <h2 className="text-sm font-medium text-gray-900">Quick Actions</h2>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button className="p-3 text-center hover:bg-gray-50 rounded-md transition-colors group">
                <Building2 className="h-5 w-5 text-gray-400 mx-auto mb-1 group-hover:text-gray-600" />
                <span className="text-xs text-gray-700">Company Profile</span>
              </button>
              <button className="p-3 text-center hover:bg-gray-50 rounded-md transition-colors group">
                <Users className="h-5 w-5 text-gray-400 mx-auto mb-1 group-hover:text-gray-600" />
                <span className="text-xs text-gray-700">Team Members</span>
              </button>
              <button className="p-3 text-center hover:bg-gray-50 rounded-md transition-colors group">
                <CreditCard className="h-5 w-5 text-gray-400 mx-auto mb-1 group-hover:text-gray-600" />
                <span className="text-xs text-gray-700">Billing</span>
              </button>
              <button className="p-3 text-center hover:bg-gray-50 rounded-md transition-colors group">
                <HelpCircle className="h-5 w-5 text-gray-400 mx-auto mb-1 group-hover:text-gray-600" />
                <span className="text-xs text-gray-700">Support</span>
              </button>
            </div>
          </div>
        </div>

        {/* Plan & Billing and HRIS Integration Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Plan & Billing Section - Left Side */}
          {permissions?.isSkillsGapUser && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-gray-500" />
                    <h2 className="text-sm font-medium text-gray-900">Plan & Usage</h2>
                  </div>
                  <Badge className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                    Free Trial
                  </Badge>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-900">Skills Gap Analysis Trial</p>
                      <p className="text-xs text-amber-700 mt-0.5">Limited features available</p>
                    </div>
                    <Sparkles className="h-4 w-4 text-amber-600" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 rounded-md p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-3 w-3 text-gray-500" />
                      <span className="text-xs text-gray-600">Employee Limit</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{permissions.maxEmployees}</p>
                    <p className="text-xs text-gray-500">maximum</p>
                  </div>
                  <div className="bg-gray-50 rounded-md p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="h-3 w-3 text-gray-500" />
                      <span className="text-xs text-gray-600">AI Features</span>
                    </div>
                    <p className="text-lg font-semibold text-orange-600">Locked</p>
                    <p className="text-xs text-gray-500">upgrade to unlock</p>
                  </div>
                </div>

                <div className="bg-indigo-50 border border-indigo-200 rounded-md p-3">
                  <p className="text-xs text-indigo-700">
                    Unlock unlimited employees, AI course generation, and advanced analytics
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700">
                    Upgrade Plan
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 text-xs">
                    Contact Sales
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* HRIS Integration Section - Right Side */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-gray-500" />
                <h2 className="text-sm font-medium text-gray-900">HR System Integration</h2>
              </div>
              {hrisConnection && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  Connected
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Automated employee data synchronization
            </p>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-8 bg-gray-100 rounded w-full"></div>
                <div className="h-16 bg-gray-100 rounded w-full"></div>
              </div>
            ) : hrisConnection ? (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-900">Connected to {hrisConnection.provider}</p>
                      <p className="text-xs text-green-700 mt-1">
                        Syncing employee data since {new Date(hrisConnection.connected_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{hrisConnection.provider}</p>
                      <p className="text-xs text-gray-500">
                        Last synced: {hrisConnection.last_sync ? new Date(hrisConnection.last_sync).toLocaleString() : 'Never'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={checkHRISConnection}
                      className="h-8 text-xs"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Refresh
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={disconnectHRIS}
                      disabled={disconnecting}
                      className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Disconnect
                    </Button>
                  </div>
                </div>

                {hrisConnection.sync_status && (
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="text-xs bg-gray-50 rounded-md p-2">
                      <span className="text-gray-500">Employees synced</span>
                      <p className="font-semibold text-gray-900">{hrisConnection.sync_status.employees_synced || 0}</p>
                    </div>
                    <div className="text-xs bg-gray-50 rounded-md p-2">
                      <span className="text-gray-500">Status</span>
                      <p className="font-semibold text-gray-900">{hrisConnection.sync_status.last_error || 'Healthy'}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-center py-2">
                  <p className="text-sm text-gray-600">Connect your HRIS for automated employee sync</p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => connectHRIS('bamboohr')}
                    className="p-3 border border-gray-200 rounded-md hover:border-gray-300 hover:bg-gray-50 transition-colors text-center group"
                  >
                    <Building2 className="h-5 w-5 text-gray-400 mx-auto mb-1 group-hover:text-gray-600" />
                    <span className="text-xs text-gray-700">BambooHR</span>
                  </button>
                  <button
                    onClick={() => connectHRIS('workday')}
                    className="p-3 border border-gray-200 rounded-md hover:border-gray-300 hover:bg-gray-50 transition-colors text-center group"
                  >
                    <Building2 className="h-5 w-5 text-gray-400 mx-auto mb-1 group-hover:text-gray-600" />
                    <span className="text-xs text-gray-700">Workday</span>
                  </button>
                  <button
                    onClick={() => connectHRIS('adp')}
                    className="p-3 border border-gray-200 rounded-md hover:border-gray-300 hover:bg-gray-50 transition-colors text-center group"
                  >
                    <Building2 className="h-5 w-5 text-gray-400 mx-auto mb-1 group-hover:text-gray-600" />
                    <span className="text-xs text-gray-700">ADP</span>
                  </button>
                </div>
                
                <p className="text-xs text-gray-500 text-center">
                  Need a different HRIS? <a href="#" className="text-indigo-600 hover:text-indigo-700">Contact support</a>
                </p>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}