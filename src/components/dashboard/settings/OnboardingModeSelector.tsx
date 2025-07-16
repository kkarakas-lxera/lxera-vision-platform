import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export function OnboardingModeSelector({ companyId, onChange }: { companyId: string; onChange?: (mode: 'manual' | 'automated') => void }) {
  const [mode, setMode] = useState<'manual' | 'automated'>('manual');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCurrentMode();
  }, [companyId]);

  const fetchCurrentMode = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('onboarding_mode')
        .eq('id', companyId)
        .single();

      if (error) throw error;
      if (data?.onboarding_mode) {
        setMode(data.onboarding_mode);
        onChange?.(data.onboarding_mode);
      }
    } catch (error) {
      console.error('Error fetching onboarding mode:', error);
      toast({
        title: "Error",
        description: "Failed to load onboarding mode",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('companies')
        .update({ onboarding_mode: mode })
        .eq('id', companyId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Onboarding mode updated successfully",
      });
      onChange?.(mode);
    } catch (error) {
      console.error('Error updating onboarding mode:', error);
      toast({
        title: "Error",
        description: "Failed to update onboarding mode",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Onboarding Mode</CardTitle>
        <CardDescription>
          Choose how you want to onboard new employees
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup value={mode} onValueChange={(value) => setMode(value as 'manual' | 'automated')}>
          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
            <RadioGroupItem value="manual" id="manual" />
            <div className="space-y-1">
              <Label htmlFor="manual" className="text-base font-medium cursor-pointer">
                Manual Mode (Traditional)
              </Label>
              <p className="text-sm text-gray-600">
                Upload CVs and manually analyze employee skills. Full control over the process.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
            <RadioGroupItem value="automated" id="automated" />
            <div className="space-y-1">
              <Label htmlFor="automated" className="text-base font-medium cursor-pointer">
                Automated Mode (AI-Powered)
              </Label>
              <p className="text-sm text-gray-600">
                Connect HRIS, employees complete profiles, and courses are automatically assigned based on skills gaps.
              </p>
            </div>
          </div>
        </RadioGroup>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}