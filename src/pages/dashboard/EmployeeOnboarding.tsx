import React, { useState, useEffect } from 'react';
import { Upload, Users, FileText, BarChart3, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CSVImportWizard } from '@/components/dashboard/EmployeeOnboarding/CSVImportWizard';
import { OnboardingProgress } from '@/components/dashboard/EmployeeOnboarding/OnboardingProgress';
import { SkillsGapAnalysis } from '@/components/dashboard/EmployeeOnboarding/SkillsGapAnalysis';
import { BulkCVUpload } from '@/components/dashboard/EmployeeOnboarding/BulkCVUpload';

interface ImportSession {
  id: string;
  import_type: string;
  total_employees: number;
  processed: number;
  successful: number;
  failed: number;
  status: string; // Allow any string for now
  created_at: string;
}

interface EmployeeStatus {
  id: string;
  name: string;
  email: string;
  position: string;
  cv_status: 'missing' | 'uploaded' | 'analyzed' | 'failed';
  skills_analysis: 'pending' | 'completed' | 'failed';
  course_generation: 'pending' | 'in_progress' | 'completed' | 'failed';
  gap_score?: number;
}

export default function EmployeeOnboarding() {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('import');
  const [importSessions, setImportSessions] = useState<ImportSession[]>([]);
  const [employeeStatuses, setEmployeeStatuses] = useState<EmployeeStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchImportSessions = async () => {
    if (!userProfile?.company_id) return;

    try {
      const { data, error } = await supabase
        .from('st_import_sessions')
        .select('*')
        .eq('company_id', userProfile.company_id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setImportSessions((data || []) as ImportSession[]);
    } catch (error) {
      console.error('Error fetching import sessions:', error);
    }
  };

  const fetchEmployeeStatuses = async () => {
    if (!userProfile?.company_id) return;

    try {
      // Get employees with their onboarding status
      const { data: employees, error } = await supabase
        .from('employees')
        .select(`
          id,
          user_id,
          position,
          cv_file_path,
          skills_last_analyzed,
          users!inner(full_name, email)
        `)
        .eq('company_id', userProfile.company_id)
        .eq('is_active', true);

      if (error) throw error;

      // Transform data to include status information
      const statuses: EmployeeStatus[] = (employees || []).map(emp => ({
        id: emp.id,
        name: emp.users.full_name,
        email: emp.users.email,
        position: emp.position || 'Not assigned',
        cv_status: emp.cv_file_path ? 'uploaded' : 'missing',
        skills_analysis: emp.skills_last_analyzed ? 'completed' : 'pending',
        course_generation: 'pending', // TODO: Check course assignment status
        gap_score: Math.floor(Math.random() * 40) + 60 // TODO: Calculate actual gap score
      }));

      setEmployeeStatuses(statuses);
    } catch (error) {
      console.error('Error fetching employee statuses:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchImportSessions(), fetchEmployeeStatuses()]);
      setLoading(false);
    };

    loadData();
  }, [userProfile?.company_id]);

  const getOverallStats = () => {
    const total = employeeStatuses.length;
    const withCV = employeeStatuses.filter(e => e.cv_status !== 'missing').length;
    const analyzed = employeeStatuses.filter(e => e.skills_analysis === 'completed').length;
    const coursesGenerated = employeeStatuses.filter(e => e.course_generation === 'completed').length;

    return { total, withCV, analyzed, coursesGenerated };
  };

  const stats = getOverallStats();

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Employee Onboarding</h1>
        <p className="text-muted-foreground mt-1">
          Bulk import employees, analyze CVs, and generate personalized learning paths
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">CVs Uploaded</p>
                <p className="text-2xl font-bold text-foreground">{stats.withCV}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.total > 0 ? Math.round((stats.withCV / stats.total) * 100) : 0}% complete
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Skills Analyzed</p>
                <p className="text-2xl font-bold text-foreground">{stats.analyzed}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.total > 0 ? Math.round((stats.analyzed / stats.total) * 100) : 0}% complete
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Courses Generated</p>
                <p className="text-2xl font-bold text-foreground">{stats.coursesGenerated}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.total > 0 ? Math.round((stats.coursesGenerated / stats.total) * 100) : 0}% complete
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="import" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import Employees
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Progress Tracking
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Skills Analysis
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Course Generation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-4">
          <CSVImportWizard
            onImportComplete={fetchImportSessions}
            importSessions={importSessions}
          />
          <BulkCVUpload
            onUploadComplete={fetchEmployeeStatuses}
          />
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <OnboardingProgress
            employees={employeeStatuses}
            onRefresh={fetchEmployeeStatuses}
          />
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <SkillsGapAnalysis
            employees={employeeStatuses}
          />
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Course Generation</CardTitle>
              <CardDescription>
                Generate personalized learning paths based on skills gap analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  Course generation integration coming soon...
                </div>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  This will integrate with the existing ContentManager to generate 4-6 week courses
                  targeting specific skills gaps identified during the analysis phase.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}