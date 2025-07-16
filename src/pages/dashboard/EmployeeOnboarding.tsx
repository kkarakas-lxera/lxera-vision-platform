import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Target, Link2, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { AutomatedOnboardingDashboard } from '@/components/dashboard/EmployeeOnboarding/AutomatedOnboardingDashboard';
import { HRISService } from '@/services/hrisService';
import OnboardingOverview from './onboarding/OnboardingOverview';
import OnboardingImport from './onboarding/OnboardingImport';
import OnboardingInvite from './onboarding/OnboardingInvite';
import OnboardingAnalysis from './onboarding/OnboardingAnalysis';

function EmployeeOnboardingRouter() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [companyMode, setCompanyMode] = useState<'manual' | 'automated'>('manual');
  const [savingMode, setSavingMode] = useState(false);
  const [hasPositions, setHasPositions] = useState(false);
  const [checkingPositions, setCheckingPositions] = useState(true);
  const [hrisConnection, setHrisConnection] = useState<any>(null);
  const [checkingHRIS, setCheckingHRIS] = useState(false);
  const [loading, setLoading] = useState(true);

  // Type guard for onboarding mode
  const isValidOnboardingMode = (mode: string): mode is 'manual' | 'automated' => {
    return mode === 'manual' || mode === 'automated';
  };

  // Fetch company's onboarding mode
  const fetchCompanyMode = async () => {
    if (!userProfile?.company_id) return;
    
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('onboarding_mode')
        .eq('id', userProfile.company_id)
        .single();
      
      if (error) throw error;
      if (data?.onboarding_mode && isValidOnboardingMode(data.onboarding_mode)) {
        setCompanyMode(data.onboarding_mode);
      }
    } catch (error) {
      console.error('Error fetching company mode:', error);
    }
  };

  // Check if company has positions defined
  const checkForPositions = async () => {
    if (!userProfile?.company_id) return;
    
    try {
      const { data, count } = await supabase
        .from('st_company_positions')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', userProfile.company_id);
      
      setHasPositions((count || 0) > 0);
    } catch (error) {
      console.error('Error checking positions:', error);
    } finally {
      setCheckingPositions(false);
    }
  };

  // Check HRIS connection
  const checkHRISConnection = async () => {
    if (!userProfile?.company_id || companyMode !== 'automated') return;
    
    setCheckingHRIS(true);
    try {
      const connection = await HRISService.getConnection(userProfile.company_id);
      setHrisConnection(connection);
    } catch (error) {
      console.error('Error checking HRIS connection:', error);
    } finally {
      setCheckingHRIS(false);
    }
  };

  // Save onboarding mode
  const saveOnboardingMode = async (mode: 'manual' | 'automated') => {
    if (!userProfile?.company_id) return;
    
    setSavingMode(true);
    try {
      const { error } = await supabase
        .from('companies')
        .update({ onboarding_mode: mode })
        .eq('id', userProfile.company_id);
      
      if (error) throw error;
      
      setCompanyMode(mode);
      toast.success(`Switched to ${mode === 'manual' ? 'Manual' : 'Automated'} mode`);
      
      // Check HRIS if switching to automated
      if (mode === 'automated') {
        checkHRISConnection();
      }
    } catch (error) {
      console.error('Error saving mode:', error);
      toast.error('Failed to update onboarding mode');
    } finally {
      setSavingMode(false);
    }
  };

  // Connect HRIS
  const connectHRIS = async (provider: string) => {
    try {
      const authUrl = await HRISService.initiateOAuth(userProfile?.company_id!, provider);
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error connecting HRIS:', error);
      toast.error('Failed to connect HRIS');
    }
  };

  useEffect(() => {
    const initializePage = async () => {
      setLoading(true);
      await fetchCompanyMode();
      await checkForPositions();
      setLoading(false);
    };

    initializePage();
  }, [userProfile]);

  useEffect(() => {
    checkHRISConnection();
  }, [companyMode]);


  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Check positions first - applies to both modes
  if (!checkingPositions && !hasPositions) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Alert className="bg-white">
          <Target className="h-5 w-5" />
          <AlertTitle>Define Positions First</AlertTitle>
          <AlertDescription className="space-y-3 mt-2">
            <p>Before you can onboard employees, you need to define at least one position with its required skills.</p>
            <Button 
              onClick={() => navigate('/dashboard/positions/new')}
              className="w-full sm:w-auto"
            >
              <Target className="h-4 w-4 mr-2" />
              Create Your First Position
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check HRIS connection for automated mode
  if (companyMode === 'automated' && !checkingHRIS && !hrisConnection) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Compact Mode Selector */}
        <Card>
          <CardContent className="p-4">
            <RadioGroup value={companyMode} onValueChange={(value) => {
              if (isValidOnboardingMode(value)) {
                saveOnboardingMode(value);
              }
            }} className="flex flex-row gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="manual" id="manual" disabled={savingMode} />
                <Label htmlFor="manual" className="cursor-pointer font-normal">Manual Mode</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="automated" id="automated" disabled={savingMode} />
                <Label htmlFor="automated" className="cursor-pointer font-normal">Automated Mode</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* HRIS Connection Required */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Connect Your HR System
            </CardTitle>
            <CardDescription>
              Automated onboarding requires connecting your HRIS for employee data synchronization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show automated dashboard if in automated mode with HRIS connected
  if (companyMode === 'automated' && hrisConnection) {
    return (
      <div className="p-6">
        {/* Compact Mode Selector */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <RadioGroup value={companyMode} onValueChange={(value) => {
              if (isValidOnboardingMode(value)) {
                saveOnboardingMode(value);
              }
            }} className="flex flex-row gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="manual" id="manual" disabled={savingMode} />
                <Label htmlFor="manual" className="cursor-pointer font-normal">Manual Mode</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="automated" id="automated" disabled={savingMode} />
                <Label htmlFor="automated" className="cursor-pointer font-normal">Automated Mode</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <AutomatedOnboardingDashboard 
          companyId={userProfile?.company_id!}
          employeeStatuses={[]}
          onRefresh={() => {}}
        />
      </div>
    );
  }

  // Manual mode - show page routes
  return (
    <OnboardingProvider>
      <Routes>
        <Route path="/" element={<OnboardingOverview />} />
        <Route path="/import" element={<OnboardingImport />} />
        <Route path="/invite" element={<OnboardingInvite />} />
        <Route path="/analysis" element={<OnboardingAnalysis />} />
      </Routes>
    </OnboardingProvider>
  );
}

export default function EmployeeOnboarding() {
  return <EmployeeOnboardingRouter />;
}
