import { useState, useEffect } from 'react';
import { Settings, Link2, Building2, CheckCircle, AlertCircle, RefreshCw, Zap, Users, Sparkles, CreditCard, HelpCircle, ArrowLeft, Bug, Lightbulb, MessageCircle, Send, X, ChevronLeft, Briefcase, Target } from 'lucide-react';
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
import { CompanyProfileModal } from '@/components/settings/CompanyProfileModal';
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

type ViewType = 'main' | 'company-profile' | 'team-members' | 'billing' | 'support';

export default function CompanySettings() {
  const { userProfile } = useAuth();
  const [hrisConnection, setHrisConnection] = useState<HRISConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);
  const [permissions, setPermissions] = useState<CompanyPermissions | null>(null);
  const [companyProfileOpen, setCompanyProfileOpen] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('main');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [companyData, setCompanyData] = useState<any>(null);
  const [companyLoading, setCompanyLoading] = useState(false);
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
      // TODO: Implement HRIS disconnect functionality
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

  const feedbackTypes = [
    {
      value: 'bug_report' as const,
      label: 'Bug Report',
      icon: Bug,
      description: 'Report a problem or issue with the platform',
      color: 'bg-red-50 text-red-700 border-red-200',
    },
    {
      value: 'feature_request' as const,
      label: 'Feature Request',
      icon: Lightbulb,
      description: 'Suggest a new feature or improvement',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      value: 'general_feedback' as const,
      label: 'General Feedback',
      icon: MessageCircle,
      description: 'Share your thoughts or suggestions',
      color: 'bg-green-50 text-green-700 border-green-200',
    },
  ];

  const categories = {
    bug_report: [
      'User Interface',
      'Data Processing',
      'Authentication',
      'Performance',
      'Integration',
      'Other',
    ],
    feature_request: [
      'Dashboard',
      'Employee Management',
      'Skills Analysis',
      'Course Management',
      'Reporting',
      'Integration',
      'Other',
    ],
    general_feedback: [
      'User Experience',
      'Performance',
      'Design',
      'Documentation',
      'Support',
      'Other',
    ],
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userProfile) {
      toast.error('Please log in to submit feedback');
      return;
    }

    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please provide both a title and description for your feedback');
      return;
    }

    setFeedbackLoading(true);

    try {
      const { error } = await supabase
        .from('tickets')
        .insert({
          first_name: userProfile.full_name.split(' ')[0] || 'User',
          last_name: userProfile.full_name.split(' ').slice(1).join(' ') || '',
          email: userProfile.email,
          company: userProfile.company_id || 'Unknown',
          job_title: userProfile.role || 'User',
          message: `${formData.title}\n\n${formData.description}`,
          priority: formData.priority,
          source: 'Platform Dashboard Settings',
        });

      if (error) {
        throw error;
      }

      toast.success('Feedback submitted successfully! We\'ll review it and get back to you soon.');

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
      toast.error('There was an error submitting your feedback. Please try again.');
    } finally {
      setFeedbackLoading(false);
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

  return (
    <div className="p-4 max-w-5xl mx-auto">
      {currentView !== 'main' && <BackButton />}
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your company settings and integrations</p>
      </div>

      {currentView === 'main' && (
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
        </div>
      )}

      {/* Support Section - Platform Feedback */}
      {currentView === 'support' && (
          <Card className="overflow-hidden">
            <CardHeader className="py-3 border-b">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Platform Feedback</CardTitle>
              </div>
              <CardDescription className="text-xs mt-1">
                Share your thoughts, report issues, or suggest improvements
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <form onSubmit={handleSubmitFeedback} className="space-y-4">
                {/* Feedback Type Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Feedback Type</Label>
                  <div className="flex gap-2">
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
                          <Icon className="h-4 w-4 mx-auto mb-1" />
                          <div className="text-xs font-medium">{type.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
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
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed description of your feedback"
                    rows={3}
                    required
                  />
                </div>

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
                  <div className="space-y-4 p-3 bg-white rounded-lg border border-gray-200">
                    {/* Category */}
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-sm">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories[formData.type].map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Priority */}
                    <div className="space-y-2">
                      <Label htmlFor="priority" className="text-sm">Priority</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value: 'low' | 'medium' | 'high') => 
                          setFormData(prev => ({ ...prev, priority: value }))
                        }
                      >
                        <SelectTrigger className="h-9">
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

                {/* Bug Report Specific Fields */}
                {formData.type === 'bug_report' && showAdvanced && (
                  <div className="space-y-3 p-3 bg-white rounded-lg border border-red-200">
                    <h4 className="text-sm font-medium text-red-800">Bug Report Details (Optional)</h4>
                    
                    <div className="space-y-2">
                      <Label htmlFor="steps" className="text-sm">Steps to Reproduce</Label>
                      <Textarea
                        id="steps"
                        value={formData.steps_to_reproduce}
                        onChange={(e) => setFormData(prev => ({ ...prev, steps_to_reproduce: e.target.value }))}
                        placeholder="1. Go to...&#10;2. Click on...&#10;3. Expected result..."
                        rows={2}
                        className="text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="expected" className="text-sm">Expected Behavior</Label>
                      <Textarea
                        id="expected"
                        value={formData.expected_behavior}
                        onChange={(e) => setFormData(prev => ({ ...prev, expected_behavior: e.target.value }))}
                        placeholder="What should have happened?"
                        rows={2}
                        className="text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="actual" className="text-sm">Actual Behavior</Label>
                      <Textarea
                        id="actual"
                        value={formData.actual_behavior}
                        onChange={(e) => setFormData(prev => ({ ...prev, actual_behavior: e.target.value }))}
                        placeholder="What actually happened?"
                        rows={2}
                        className="text-sm"
                      />
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
                  <Button
                    type="submit"
                    disabled={feedbackLoading}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {feedbackLoading ? 'Submitting...' : 'Submit Feedback'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
      )}

      {/* Company Profile Section */}
      {currentView === 'company-profile' && (
        <Card className="overflow-hidden">
          <CardHeader className="py-3 border-b">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Company Profile</CardTitle>
            </div>
            <CardDescription className="text-xs mt-1">
              View and manage your company information
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {companyLoading ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
            ) : companyData ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Company Name</Label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">{companyData.company || 'Not set'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Team Size</Label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        {companyData.team_size === '1-10' ? '1-10 employees' :
                         companyData.team_size === '11-50' ? '11-50 employees' :
                         companyData.team_size === '51-200' ? '51-200 employees' :
                         companyData.team_size === '201-500' ? '201-500 employees' :
                         companyData.team_size === '500+' ? '500+ employees' :
                         companyData.team_size || 'Not specified'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Industry</Label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">{companyData.industry || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Use Case</Label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        {companyData.use_case === 'skills_assessment' ? 'Skills Assessment' :
                         companyData.use_case === 'learning_development' ? 'Learning & Development' :
                         companyData.use_case === 'talent_management' ? 'Talent Management' :
                         companyData.use_case === 'workforce_planning' ? 'Workforce Planning' :
                         companyData.use_case || 'Not specified'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCompanyProfileOpen(true)}
                  >
                    Edit Company Profile
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No company data found</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

        {/* Billing Section */}
        {currentView === 'billing' && permissions?.isSkillsGapUser && (
          <Card className="overflow-hidden">
            <CardHeader className="py-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base">Billing & Plan</CardTitle>
                </div>
                <Badge className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                  Free Trial
                </Badge>
              </div>
              <CardDescription className="text-xs mt-1">
                Manage your subscription and billing details
              </CardDescription>
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

        {/* Team Members Section */}
        {currentView === 'team-members' && (
          <Card className="overflow-hidden">
            <CardHeader className="py-3 border-b">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Team Members</CardTitle>
              </div>
              <CardDescription className="text-xs mt-1">
                Manage your company team members and their roles
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {teamLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-center justify-between p-3 bg-gray-100 rounded-md">
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-32"></div>
                          <div className="h-3 bg-gray-200 rounded w-48"></div>
                        </div>
                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : teamMembers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No team members found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-indigo-700">
                            {member.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{member.full_name}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs font-medium text-foreground capitalize">{member.role || 'Team Member'}</p>
                          {member.position && <p className="text-xs text-muted-foreground">{member.position}</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Joined</p>
                          <p className="text-xs font-medium text-foreground">
                            {new Date(member.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            member.is_active !== false 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : 'bg-gray-50 text-gray-700 border-gray-200'
                          }`}
                        >
                          {member.is_active !== false ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Company Profile Modal */}
        <CompanyProfileModal 
          open={companyProfileOpen} 
          onOpenChange={setCompanyProfileOpen} 
        />
    </div>
  );
}