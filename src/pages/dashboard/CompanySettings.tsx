import { useState, useEffect } from 'react';
import { Settings, Link2, Building2, CheckCircle, AlertCircle, RefreshCw, Zap, Users, Sparkles, CreditCard, HelpCircle, ArrowLeft, Bug, Lightbulb, MessageCircle, Send, X, ChevronLeft, Briefcase, Target, Edit2, Save, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { HRISService } from '@/services/hrisService';
import { toast } from 'sonner';
import { getCompanyPermissions, type CompanyPermissions } from '@/utils/permissions';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';

type FeedbackType = 'bug_report' | 'feature_request' | 'general_feedback';

interface FeedbackFormData {
  type: FeedbackType;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  steps_to_reproduce?: string;
  expected_behavior?: string;
  actual_behavior?: string;
  browser_info?: string;
}

interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  role: string;
  position?: string;
  department?: string;
  created_at: string;
  is_active?: boolean;
}

interface HRISConnection {
  id: string;
  company_id: string;
  provider: string;
  connected_at: string;
  last_sync?: string;
  sync_status?: {
    employees_synced: number;
    last_error?: string;
  };
}

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

type ViewType = 'main' | 'company-profile' | 'team-members' | 'billing' | 'support';

export default function CompanySettings() {
  const { userProfile } = useAuth();
  const [hrisConnection, setHrisConnection] = useState<HRISConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);
  const [permissions, setPermissions] = useState<CompanyPermissions | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('main');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [companyData, setCompanyData] = useState<SkillsGapLead | null>(null);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [editCompanyData, setEditCompanyData] = useState<SkillsGapLead | null>(null);
  const [savingCompany, setSavingCompany] = useState(false);
  const [formData, setFormData] = useState<FeedbackFormData>({
    type: 'general_feedback',
    title: '',
    description: '',
    priority: 'medium',
    category: '',
    steps_to_reproduce: '',
    expected_behavior: '',
    actual_behavior: '',
    browser_info: typeof window !== 'undefined' ? navigator.userAgent : '',
  });

  useEffect(() => {
    checkHRISConnection();
    fetchPermissions();
  }, [userProfile?.company_id]);

  useEffect(() => {
    if (currentView === 'team-members' && userProfile?.company_id) {
      fetchTeamMembers();
    }
    if (currentView === 'company-profile' && userProfile?.company_id) {
      fetchCompanyData();
    }
  }, [currentView, userProfile?.company_id]);

  const fetchPermissions = async () => {
    if (userProfile?.company_id) {
      const companyPermissions = await getCompanyPermissions(userProfile.company_id);
      setPermissions(companyPermissions);
    }
  };

  const fetchTeamMembers = async () => {
    if (!userProfile?.company_id) return;
    
    setTeamLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('company_id', userProfile.company_id)
        .neq('role', 'learner')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching team members:', error);
        toast.error('Failed to load team members');
      } else {
        setTeamMembers(data || []);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast.error('Failed to load team members');
    } finally {
      setTeamLoading(false);
    }
  };

  const fetchCompanyData = async () => {
    if (!userProfile?.email) return;
    
    setCompanyLoading(true);
    try {
      const { data, error } = await supabase
        .from('skills_gap_leads')
        .select('*')
        .eq('email', userProfile.email)
        .eq('status', 'converted')
        .single();

      if (error) {
        console.error('Error fetching company data:', error);
        // Don't show error toast, just set no data
      } else {
        setCompanyData(data);
        setEditCompanyData(data);
      }
    } catch (error) {
      console.error('Error fetching company data:', error);
    } finally {
      setCompanyLoading(false);
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

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setFeedbackLoading(true);
    try {
      const { error } = await supabase
        .from('platform_feedback')
        .insert({
          user_id: userProfile?.id,
          company_id: userProfile?.company_id,
          type: formData.type,
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          category: formData.category,
          steps_to_reproduce: formData.steps_to_reproduce,
          expected_behavior: formData.expected_behavior,
          actual_behavior: formData.actual_behavior,
          browser_info: formData.browser_info,
          status: 'new'
        });

      if (error) {
        throw error;
      }

      toast.success('Thank you for your feedback! We\'ll review it shortly.');
      
      // Reset form
      setFormData({
        type: 'general_feedback',
        title: '',
        description: '',
        priority: 'medium',
        category: '',
        steps_to_reproduce: '',
        expected_behavior: '',
        actual_behavior: '',
        browser_info: typeof window !== 'undefined' ? navigator.userAgent : '',
      });
      setShowAdvanced(false);
      setShowFeedback(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const feedbackTypes = [
    { value: 'bug_report', label: 'Bug Report', icon: Bug, color: 'border-red-200 bg-red-50 text-red-700' },
    { value: 'feature_request', label: 'Feature Request', icon: Lightbulb, color: 'border-blue-200 bg-blue-50 text-blue-700' },
    { value: 'general_feedback', label: 'General Feedback', icon: MessageCircle, color: 'border-gray-200 bg-gray-50 text-gray-700' }
  ];

  const categories = {
    bug_report: ['UI/UX', 'Performance', 'Data Issues', 'Authentication', 'Other'],
    feature_request: ['Dashboard', 'Courses', 'Analytics', 'Integrations', 'Other'],
    general_feedback: ['User Experience', 'Documentation', 'Support', 'Pricing', 'Other']
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

  const handleEditCompany = () => {
    setIsEditingCompany(true);
    setEditCompanyData(companyData);
  };

  const handleCancelEditCompany = () => {
    setIsEditingCompany(false);
    setEditCompanyData(companyData);
  };

  const handleSaveCompany = async () => {
    if (!editCompanyData || !companyData) return;

    setSavingCompany(true);
    try {
      const { error } = await supabase
        .from('skills_gap_leads')
        .update({
          company: editCompanyData.company,
          name: editCompanyData.name,
          role: editCompanyData.role,
          team_size: editCompanyData.team_size,
          use_case: editCompanyData.use_case,
          heard_about: editCompanyData.heard_about
        })
        .eq('id', editCompanyData.id);

      if (error) {
        throw error;
      }

      setCompanyData(editCompanyData);
      setIsEditingCompany(false);
      toast.success('Company profile updated successfully');
    } catch (err) {
      console.error('Error saving company profile:', err);
      toast.error('Failed to update company profile');
    } finally {
      setSavingCompany(false);
    }
  };

  const navigateToSection = (section: ViewType) => {
    setCurrentView(section);
    if (section === 'support') {
      setShowFeedback(true);
    } else {
      setShowFeedback(false);
    }
  };

  const BackButton = () => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        setCurrentView('main');
        setShowFeedback(false);
      }}
      className="mb-4"
    >
      <ChevronLeft className="h-4 w-4 mr-1" />
      Back to Settings
    </Button>
  );

  if (currentView !== 'main') {
    return (
      <div className="p-4 max-w-5xl mx-auto">
        <BackButton />
        
        {currentView === 'company-profile' && (
          <Card className="overflow-hidden">
            <CardHeader className="py-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base">Company Profile</CardTitle>
                </div>
                {companyData && !isEditingCompany && (
                  <Button size="sm" variant="outline" onClick={handleEditCompany}>
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
                {isEditingCompany && (
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={handleCancelEditCompany}>
                      <XCircle className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveCompany} disabled={savingCompany}>
                      <Save className="h-4 w-4 mr-1" />
                      {savingCompany ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                )}
              </div>
              <CardDescription className="text-xs mt-1">
                Company information and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {companyLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : companyData ? (
                <div className="space-y-4">
                  {/* Company Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500">Company Name</label>
                      {isEditingCompany ? (
                        <Input
                          value={editCompanyData?.company || ''}
                          onChange={(e) => setEditCompanyData(editCompanyData ? {...editCompanyData, company: e.target.value} : null)}
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-sm font-medium text-gray-900">{companyData.company}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Team Size</label>
                      {isEditingCompany ? (
                        <Select
                          value={editCompanyData?.team_size || ''}
                          onValueChange={(value) => setEditCompanyData(editCompanyData ? {...editCompanyData, team_size: value} : null)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-10">1-10 employees</SelectItem>
                            <SelectItem value="11-50">11-50 employees</SelectItem>
                            <SelectItem value="51-200">51-200 employees</SelectItem>
                            <SelectItem value="201-500">201-500 employees</SelectItem>
                            <SelectItem value="500+">500+ employees</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-sm font-medium text-gray-900">{formatTeamSize(companyData.team_size)}</p>
                      )}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="pt-3 border-t">
                    <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Users className="h-3 w-3" />
                      Contact Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500">Contact Name</label>
                        {isEditingCompany ? (
                          <Input
                            value={editCompanyData?.name || ''}
                            onChange={(e) => setEditCompanyData(editCompanyData ? {...editCompanyData, name: e.target.value} : null)}
                            className="mt-1"
                          />
                        ) : (
                          <p className="text-sm font-medium text-gray-900">{companyData.name}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Email</label>
                        <p className="text-sm font-medium text-gray-900">{companyData.email}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Role</label>
                        {isEditingCompany ? (
                          <Input
                            value={editCompanyData?.role || ''}
                            onChange={(e) => setEditCompanyData(editCompanyData ? {...editCompanyData, role: e.target.value} : null)}
                            className="mt-1"
                          />
                        ) : (
                          <p className="text-sm font-medium text-gray-900">{companyData.role}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Member Since</label>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(companyData.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Usage Information */}
                  <div className="pt-3 border-t">
                    <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Target className="h-3 w-3" />
                      Usage Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500">Primary Use Case</label>
                        {isEditingCompany ? (
                          <Select
                            value={editCompanyData?.use_case || ''}
                            onValueChange={(value) => setEditCompanyData(editCompanyData ? {...editCompanyData, use_case: value} : null)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select use case" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="skills_assessment">Skills Assessment</SelectItem>
                              <SelectItem value="learning_development">Learning & Development</SelectItem>
                              <SelectItem value="talent_management">Talent Management</SelectItem>
                              <SelectItem value="workforce_planning">Workforce Planning</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-sm font-medium text-gray-900">
                            {companyData.use_case ? formatUseCase(companyData.use_case) : 'Not specified'}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">How They Found Us</label>
                        {isEditingCompany ? (
                          <Select
                            value={editCompanyData?.heard_about || ''}
                            onValueChange={(value) => setEditCompanyData(editCompanyData ? {...editCompanyData, heard_about: value} : null)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select source" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="search">Search Engine</SelectItem>
                              <SelectItem value="social_media">Social Media</SelectItem>
                              <SelectItem value="referral">Referral</SelectItem>
                              <SelectItem value="linkedin">LinkedIn</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-sm font-medium text-gray-900">
                            {companyData.heard_about ? formatHeardAbout(companyData.heard_about) : 'Not specified'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-xs text-gray-500">Account Status</label>
                        <div className="mt-1">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Active
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No company profile data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {currentView === 'team-members' && (
          <Card className="overflow-hidden">
            <CardHeader className="py-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base">Team Members</CardTitle>
                </div>
                <Button size="sm">
                  <Users className="h-4 w-4 mr-1" />
                  Invite Member
                </Button>
              </div>
              <CardDescription className="text-xs mt-1">
                Manage your team members and permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {teamLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : teamMembers.length > 0 ? (
                <div className="space-y-3">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-indigo-700">
                            {member.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{member.full_name}</p>
                          <p className="text-xs text-gray-500">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {member.role === 'company_admin' ? 'Admin' : 'Member'}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No team members found</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {currentView === 'billing' && (
          <Card className="overflow-hidden">
            <CardHeader className="py-3 border-b">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Billing & Subscription</CardTitle>
              </div>
              <CardDescription className="text-xs mt-1">
                Manage your subscription and payment methods
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                {permissions?.isSkillsGapUser && (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-amber-900">Skills Gap Analysis Trial</p>
                        <p className="text-xs text-amber-700 mt-0.5">Limited features available</p>
                      </div>
                      <Sparkles className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Button size="sm" className="bg-primary hover:bg-primary/90">
                        Upgrade Plan
                      </Button>
                      <Button variant="outline" size="sm">
                        Contact Sales
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-3">Billing portal coming soon</p>
                  <p className="text-xs text-gray-400">Contact support for billing inquiries</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {currentView === 'support' && (
          <Card className="overflow-hidden">
            <CardHeader className="py-3 border-b">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Support & Feedback</CardTitle>
              </div>
              <CardDescription className="text-xs mt-1">
                Get help and share your feedback
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {!showFeedback ? (
                <div className="space-y-3">
                  <Button 
                    onClick={() => setShowFeedback(true)} 
                    className="w-full"
                    variant="outline"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Feedback
                  </Button>
                  <div className="text-center text-sm text-gray-500">
                    <p>Need immediate help?</p>
                    <p className="mt-1">Email us at <a href="mailto:support@lxera.ai" className="text-primary hover:underline">support@lxera.ai</a></p>
                  </div>
                </div>
              ) : (
                <form onSubmit={submitFeedback} className="space-y-4">
                  {/* Feedback Type Selection */}
                  <div className="grid grid-cols-3 gap-2">
                    {feedbackTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, type: type.value, category: '' }))}
                          className={`flex-1 p-2 rounded-lg border text-center transition-colors ${
                            formData.type === type.value
                              ? type.color
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon className="h-5 w-5 mx-auto mb-1" />
                          <span className="text-xs font-medium">{type.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Brief summary of your feedback"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Provide details about your feedback..."
                      className="min-h-[100px]"
                      required
                    />
                  </div>

                  {/* Bug Report Fields */}
                  {formData.type === 'bug_report' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="steps" className="text-sm">Steps to Reproduce</Label>
                        <Textarea
                          id="steps"
                          value={formData.steps_to_reproduce}
                          onChange={(e) => setFormData(prev => ({ ...prev, steps_to_reproduce: e.target.value }))}
                          placeholder="1. Go to...\n2. Click on...\n3. See error..."
                          className="min-h-[80px]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expected" className="text-sm">Expected Behavior</Label>
                          <Textarea
                            id="expected"
                            value={formData.expected_behavior}
                            onChange={(e) => setFormData(prev => ({ ...prev, expected_behavior: e.target.value }))}
                            placeholder="What should happen?"
                            className="min-h-[60px]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="actual" className="text-sm">Actual Behavior</Label>
                          <Textarea
                            id="actual"
                            value={formData.actual_behavior}
                            onChange={(e) => setFormData(prev => ({ ...prev, actual_behavior: e.target.value }))}
                            placeholder="What actually happens?"
                            className="min-h-[60px]"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Show More Options Button */}
                  {!showAdvanced && (
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(true)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      + More options (category, priority)
                    </button>
                  )}

                  {/* Advanced Options */}
                  {showAdvanced && (
                    <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-sm">Category</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger id="category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories[formData.type as FeedbackType].map((cat) => (
                              <SelectItem key={cat} value={cat.toLowerCase().replace(/[^a-z0-9]/g, '_')}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="priority" className="text-sm">Priority</Label>
                        <Select
                          value={formData.priority}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as 'low' | 'medium' | 'high' }))}
                        >
                          <SelectTrigger id="priority">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowFeedback(false)}
                      disabled={feedbackLoading}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={feedbackLoading}>
                      {feedbackLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Submit Feedback
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your company settings and integrations</p>
      </div>

      <div className="space-y-4">
        {/* Quick Actions */}
        <Card className="overflow-hidden">
          <CardHeader className="py-3 border-b">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button 
                onClick={() => navigateToSection('company-profile')}
                className="p-3 text-center hover:bg-gray-50 rounded-md transition-colors group"
              >
                <Building2 className="h-5 w-5 text-muted-foreground mx-auto mb-1 group-hover:text-foreground" />
                <span className="text-xs text-foreground">Company Profile</span>
              </button>
              <button 
                onClick={() => navigateToSection('team-members')}
                className="p-3 text-center hover:bg-gray-50 rounded-md transition-colors group"
              >
                <Users className="h-5 w-5 text-muted-foreground mx-auto mb-1 group-hover:text-foreground" />
                <span className="text-xs text-foreground">Team Members</span>
              </button>
              <button 
                onClick={() => navigateToSection('billing')}
                className="p-3 text-center hover:bg-gray-50 rounded-md transition-colors group"
              >
                <CreditCard className="h-5 w-5 text-muted-foreground mx-auto mb-1 group-hover:text-foreground" />
                <span className="text-xs text-foreground">Billing</span>
              </button>
              <button 
                onClick={() => navigateToSection('support')}
                className="p-3 text-center hover:bg-gray-50 rounded-md transition-colors group"
              >
                <HelpCircle className="h-5 w-5 text-muted-foreground mx-auto mb-1 group-hover:text-foreground" />
                <span className="text-xs text-foreground">Support</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Plan & Billing and HRIS Integration Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Plan & Billing Section - Left Side */}
          {permissions?.isSkillsGapUser && (
            <Card className="overflow-hidden">
              <CardHeader className="py-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-base">Plan & Usage</CardTitle>
                  </div>
                  <Badge className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                    Free Trial
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
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
                      <span className="text-xs text-muted-foreground">Employee Limit</span>
                    </div>
                    <p className="text-lg font-semibold text-foreground">{permissions.maxEmployees}</p>
                    <p className="text-xs text-muted-foreground">maximum</p>
                  </div>
                  <div className="bg-gray-50 rounded-md p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="h-3 w-3 text-gray-500" />
                      <span className="text-xs text-muted-foreground">AI Features</span>
                    </div>
                    <p className="text-lg font-semibold text-orange-600">Locked</p>
                    <p className="text-xs text-muted-foreground">upgrade to unlock</p>
                  </div>
                </div>

                <div className="bg-indigo-50 border border-indigo-200 rounded-md p-3">
                  <p className="text-xs text-indigo-700">
                    Unlock unlimited employees, AI course generation, and advanced analytics
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    Upgrade Plan
                  </Button>
                  <Button variant="outline" size="sm">
                    Contact Sales
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* HRIS Integration Section - Right Side */}
        <Card className="overflow-hidden">
          <CardHeader className="py-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">HR System Integration</CardTitle>
              </div>
              {hrisConnection && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  Connected
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs mt-1">
              Automated employee data synchronization
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
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
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{hrisConnection.provider}</p>
                      <p className="text-xs text-muted-foreground">
                        Last synced: {hrisConnection.last_sync ? new Date(hrisConnection.last_sync).toLocaleString() : 'Never'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={checkHRISConnection}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Refresh
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={disconnectHRIS}
                      disabled={disconnecting}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Disconnect
                    </Button>
                  </div>
                </div>

                {hrisConnection.sync_status && (
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="text-xs bg-gray-50 rounded-md p-2">
                      <span className="text-muted-foreground">Employees synced</span>
                      <p className="font-semibold text-foreground">{hrisConnection.sync_status.employees_synced || 0}</p>
                    </div>
                    <div className="text-xs bg-gray-50 rounded-md p-2">
                      <span className="text-muted-foreground">Status</span>
                      <p className="font-semibold text-foreground">{hrisConnection.sync_status.last_error || 'Healthy'}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-center py-2">
                  <p className="text-sm text-muted-foreground">Connect your HRIS for automated employee sync</p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => connectHRIS('bamboohr')}
                    className="p-3 border border-gray-200 rounded-md hover:border-gray-300 hover:bg-gray-50 transition-colors text-center group"
                  >
                    <Building2 className="h-5 w-5 text-muted-foreground mx-auto mb-1 group-hover:text-foreground" />
                    <span className="text-xs text-foreground">BambooHR</span>
                  </button>
                  <button
                    onClick={() => connectHRIS('workday')}
                    className="p-3 border border-gray-200 rounded-md hover:border-gray-300 hover:bg-gray-50 transition-colors text-center group"
                  >
                    <Building2 className="h-5 w-5 text-muted-foreground mx-auto mb-1 group-hover:text-foreground" />
                    <span className="text-xs text-foreground">Workday</span>
                  </button>
                  <button
                    onClick={() => connectHRIS('adp')}
                    className="p-3 border border-gray-200 rounded-md hover:border-gray-300 hover:bg-gray-50 transition-colors text-center group"
                  >
                    <Building2 className="h-5 w-5 text-muted-foreground mx-auto mb-1 group-hover:text-foreground" />
                    <span className="text-xs text-foreground">ADP</span>
                  </button>
                </div>
                
                <p className="text-xs text-muted-foreground text-center">
                  Need a different HRIS? <a href="#" className="text-primary hover:text-primary/90">Contact support</a>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}