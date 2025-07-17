import { useState, useEffect } from 'react';
import { Building2, Users, Briefcase, Target, Info, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface SkillsGapLead {
  id: string;
  email: string;
  name: string;
  company: string;
  role: string;
  team_size: string;
  use_case: string;
  heard_about: string;
  created_at: string;
  status: string;
}

interface CompanyProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CompanyProfileModal({ open, onOpenChange }: CompanyProfileModalProps) {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [leadData, setLeadData] = useState<SkillsGapLead | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && userProfile?.email) {
      fetchSkillsGapLead();
    }
  }, [open, userProfile?.email]);

  const fetchSkillsGapLead = async () => {
    if (!userProfile?.email) return;

    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('skills_gap_leads')
        .select('*')
        .eq('email', userProfile.email)
        .eq('status', 'converted')
        .single();

      if (error) {
        console.error('Error fetching skills gap lead:', error);
        setError('Unable to load company profile data');
      } else if (data) {
        console.log('Skills gap lead data:', data); // Debug log
        setLeadData(data);
      } else {
        setError('No company profile data found');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatTeamSize = (size: string) => {
    const sizeMap: Record<string, string> = {
      '1-10': '1-10 employees',
      '11-50': '11-50 employees',
      '51-200': '51-200 employees',
      '201-500': '201-500 employees',
      '500+': '500+ employees'
    };
    return sizeMap[size] || size;
  };

  const formatUseCase = (useCase: string) => {
    const useCaseMap: Record<string, string> = {
      'skills_assessment': 'Skills Assessment',
      'learning_development': 'Learning & Development',
      'talent_management': 'Talent Management',
      'workforce_planning': 'Workforce Planning',
      'other': 'Other'
    };
    return useCaseMap[useCase] || useCase;
  };

  const formatHeardAbout = (source: string) => {
    const sourceMap: Record<string, string> = {
      'search': 'Search Engine',
      'social_media': 'Social Media',
      'referral': 'Referral',
      'linkedin': 'LinkedIn',
      'other': 'Other'
    };
    return sourceMap[source] || source;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
                <X className="h-6 w-6 text-red-600" />
              </div>
              <p className="text-gray-600">{error}</p>
            </div>
          ) : leadData ? (
            <>
              {/* Company Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Company Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500">Company Name</label>
                    <p className="text-sm font-medium text-gray-900">{leadData.company}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Team Size</label>
                    <p className="text-sm font-medium text-gray-900">{formatTeamSize(leadData.team_size)}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500">Contact Name</label>
                    <p className="text-sm font-medium text-gray-900">{leadData.name}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Email</label>
                    <p className="text-sm font-medium text-gray-900">{leadData.email}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Role</label>
                    <p className="text-sm font-medium text-gray-900">{leadData.role}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Account Status</label>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Active
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Usage Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Usage Information
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-xs text-gray-500">Primary Use Case</label>
                    <p className="text-sm font-medium text-gray-900">
                      {leadData.use_case ? formatUseCase(leadData.use_case) : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">How They Found Us</label>
                    <p className="text-sm font-medium text-gray-900">
                      {leadData.heard_about ? formatHeardAbout(leadData.heard_about) : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Member Since</label>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(leadData.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Skills Gap Analysis Account</p>
                    <p className="text-xs">
                      This company profile was created during the Skills Gap Analysis signup process. 
                      To update company information, please contact support.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}