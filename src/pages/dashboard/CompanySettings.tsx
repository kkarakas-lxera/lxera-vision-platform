import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { OnboardingModeSelector } from '@/components/dashboard/settings/OnboardingModeSelector';
import { HRISConnector } from '@/components/dashboard/settings/HRISConnector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function CompanySettings() {
  const { userProfile } = useAuth();
  const [onboardingMode, setOnboardingMode] = useState<'manual' | 'automated'>('manual');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile?.company_id) {
      fetchCompanyMode();
    }
  }, [userProfile?.company_id]);

  const fetchCompanyMode = async () => {
    if (!userProfile?.company_id) return;
    
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('onboarding_mode')
        .eq('id', userProfile.company_id)
        .single();
      
      if (!error && data?.onboarding_mode) {
        setOnboardingMode(data.onboarding_mode);
      }
    } catch (error) {
      console.error('Error fetching company mode:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!userProfile?.company_id || loading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-gray-600" />
        <h1 className="text-2xl font-bold">Company Settings</h1>
      </div>

      <div className="grid gap-6">
        {/* Onboarding Mode Section */}
        <OnboardingModeSelector 
          companyId={userProfile.company_id} 
          onChange={(mode) => setOnboardingMode(mode)}
        />

        {/* HRIS Connector - Only show when automated mode is selected */}
        {onboardingMode === 'automated' && (
          <HRISConnector companyId={userProfile.company_id} />
        )}

        {/* Placeholder for future settings */}
        <Card>
          <CardHeader>
            <CardTitle>More Settings</CardTitle>
            <CardDescription>
              Additional company settings will be available here
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Configure additional company preferences and integrations
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}