
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  User, 
  Target, 
  TrendingUp, 
  CheckCircle2,
  AlertCircle,
  Eye
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { SkillBadge } from '@/components/dashboard/shared/SkillBadge';

interface AnalysisResult {
  id: string;
  employee_id: string;
  cv_file_path: string;
  cv_summary: string;
  extracted_skills: {
    skill_id: string;
    skill_name: string;
    confidence: number;
    evidence: string;
    years_experience?: number;
    proficiency_level: number;
    skill_path?: string;
    is_custom?: boolean;
  }[];
  skills_match_score: number;
  career_readiness_score: number;
  current_position_id?: string;
  target_position_id?: string;
  analyzed_at: string;
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  position?: string;
  department?: string;
}

export function CVAnalysis() {
  const { userProfile } = useAuth();
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    if (userProfile?.company_id) {
      fetchAnalyses();
    }
  }, [userProfile]);

  const fetchAnalyses = async () => {
    if (!userProfile?.company_id) return;

    try {
      setLoading(true);

      // Fetch analyses with employee data
      const { data: analysesData, error: analysesError } = await supabase
        .from('st_employee_skills_profile')
        .select(`
          *,
          employees!inner(id, first_name, last_name, email, position, department, company_id)
        `)
        .eq('employees.company_id', userProfile.company_id)
        .order('analyzed_at', { ascending: false });

      if (analysesError) throw analysesError;

      // Transform the data to match our interface
      const transformedAnalyses: AnalysisResult[] = (analysesData || []).map(item => ({
        id: item.id,
        employee_id: item.employee_id,
        cv_file_path: item.cv_file_path,
        cv_summary: item.cv_summary,
        extracted_skills: Array.isArray(item.extracted_skills) 
          ? item.extracted_skills.map((skill: any) => ({
              skill_id: skill.skill_id || '',
              skill_name: skill.skill_name || '',
              confidence: skill.confidence || 0,
              evidence: skill.evidence || '',
              years_experience: skill.years_experience,
              proficiency_level: skill.proficiency_level || 0,
              skill_path: skill.skill_path,
              is_custom: skill.is_custom || false
            }))
          : [],
        skills_match_score: item.skills_match_score || 0,
        career_readiness_score: item.career_readiness_score || 0,
        current_position_id: item.current_position_id,
        target_position_id: item.target_position_id,
        analyzed_at: item.analyzed_at
      }));

      setAnalyses(transformedAnalyses);

      // Extract unique employees
      const uniqueEmployees = analysesData?.map(item => item.employees).filter(Boolean) || [];
      setEmployees(uniqueEmployees);

    } catch (error) {
      console.error('Error fetching analyses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load CV analyses',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeById = (employeeId: string) => {
    return employees.find(emp => emp.id === employeeId);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No CV analyses found. Upload and analyze CVs to see results here.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">CV Analysis Results</h2>
          <p className="text-muted-foreground">
            Review analyzed CVs and skills profiles
          </p>
        </div>
        <Badge variant="outline">
          {analyses.length} Analyses
        </Badge>
      </div>

      <div className="grid gap-6">
        {analyses.map((analysis) => {
          const employee = getEmployeeById(analysis.employee_id);
          
          return (
            <Card key={analysis.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown Employee'}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {employee?.position || 'No position specified'} • {employee?.department || 'No department'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getScoreBadgeVariant(analysis.career_readiness_score)}>
                      {analysis.career_readiness_score}% Ready
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedAnalysis(analysis)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Summary */}
                <div>
                  <h4 className="font-medium mb-2">CV Summary</h4>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {analysis.cv_summary}
                  </p>
                </div>

                {/* Scores */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Skills Match</span>
                      <span className={`text-sm font-bold ${getScoreColor(analysis.skills_match_score)}`}>
                        {analysis.skills_match_score}%
                      </span>
                    </div>
                    <Progress value={analysis.skills_match_score} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Career Readiness</span>
                      <span className={`text-sm font-bold ${getScoreColor(analysis.career_readiness_score)}`}>
                        {analysis.career_readiness_score}%
                      </span>
                    </div>
                    <Progress value={analysis.career_readiness_score} className="h-2" />
                  </div>
                </div>

                {/* Top Skills */}
                <div>
                  <h4 className="font-medium mb-2">Extracted Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.extracted_skills.slice(0, 6).map((skill, index) => (
                      <SkillBadge
                        key={index}
                        skill={skill}
                        size="sm"
                        showConfidence
                      />
                    ))}
                    {analysis.extracted_skills.length > 6 && (
                      <Badge variant="outline" className="text-xs">
                        +{analysis.extracted_skills.length - 6} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Analysis Date */}
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Analyzed {new Date(analysis.analyzed_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
