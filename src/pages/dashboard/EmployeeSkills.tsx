import React, { useState, useEffect } from 'react';
import { Upload, FileText, AlertCircle, ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { CVUploadDialog } from '@/components/dashboard/EmployeeOnboarding/CVUploadDialog';

interface EmployeeSkill {
  skill_name: string;
  current_level: number;
  required_level: number;
}

interface EmployeeSkillData {
  id: string;
  name: string;
  email: string;
  position_code: string;
  position_title: string;
  has_cv: boolean;
  analysis_status: 'pending' | 'analyzing' | 'completed' | 'failed';
  match_percentage: number | null;
  skill_gaps: EmployeeSkill[];
  total_required_skills: number;
  matched_skills: number;
}

export default function EmployeeSkills() {
  const { userProfile } = useAuth();
  const [employees, setEmployees] = useState<EmployeeSkillData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [showCVUpload, setShowCVUpload] = useState(false);
  const [uploadEmployeeId, setUploadEmployeeId] = useState<string | null>(null);

  const fetchEmployeeSkills = async () => {
    if (!userProfile?.company_id) return;

    try {
      setLoading(true);
      
      // Fetch employees with their positions and skills
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select(`
          id,
          position,
          cv_file_path,
          skills_last_analyzed,
          users!inner(full_name, email),
          st_company_positions!employees_position_fkey(
            position_code,
            position_title,
            required_skills
          )
        `)
        .eq('company_id', userProfile.company_id)
        .eq('is_active', true);

      if (employeesError) throw employeesError;

      // Fetch skills profiles
      const { data: skillsProfiles, error: profilesError } = await supabase
        .from('st_employee_skills_profile')
        .select('*')
        .in('employee_id', employeesData?.map(e => e.id) || []);

      if (profilesError) throw profilesError;

      // Map data to our interface
      const mappedEmployees: EmployeeSkillData[] = (employeesData || []).map(emp => {
        const profile = skillsProfiles?.find(p => p.employee_id === emp.id);
        const position = emp.st_company_positions;
        
        // Calculate skill gaps if we have both position requirements and employee skills
        let skillGaps: EmployeeSkill[] = [];
        let matchedSkills = 0;
        const totalRequiredSkills = position?.required_skills?.length || 0;

        if (position?.required_skills && profile?.skills_data?.skills) {
          const employeeSkills = profile.skills_data.skills;
          
          skillGaps = position.required_skills
            .map((reqSkill: any) => {
              const empSkill = employeeSkills.find((es: any) => 
                es.name.toLowerCase() === reqSkill.skill_name.toLowerCase()
              );
              
              if (empSkill && empSkill.level >= reqSkill.proficiency_level) {
                matchedSkills++;
                return null;
              }
              
              return {
                skill_name: reqSkill.skill_name,
                required_level: reqSkill.proficiency_level,
                current_level: empSkill?.level || 0
              };
            })
            .filter(Boolean);
        }

        const matchPercentage = totalRequiredSkills > 0 
          ? Math.round((matchedSkills / totalRequiredSkills) * 100)
          : null;

        return {
          id: emp.id,
          name: emp.users.full_name,
          email: emp.users.email,
          position_code: position?.position_code || emp.position || 'Not Assigned',
          position_title: position?.position_title || 'Position Not Found',
          has_cv: !!emp.cv_file_path,
          analysis_status: emp.cv_file_path 
            ? (profile ? 'completed' : 'pending')
            : 'pending',
          match_percentage: matchPercentage,
          skill_gaps: skillGaps,
          total_required_skills: totalRequiredSkills,
          matched_skills: matchedSkills
        };
      });

      setEmployees(mappedEmployees);
    } catch (error) {
      console.error('Error fetching employee skills:', error);
      toast.error('Failed to load employee skills data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeSkills();
  }, [userProfile?.company_id]);

  const toggleRowExpansion = (employeeId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(employeeId)) {
      newExpanded.delete(employeeId);
    } else {
      newExpanded.add(employeeId);
    }
    setExpandedRows(newExpanded);
  };

  const handleCVUpload = (employeeId: string) => {
    setUploadEmployeeId(employeeId);
    setShowCVUpload(true);
  };

  const getMatchBadgeColor = (percentage: number | null) => {
    if (percentage === null) return 'bg-gray-100 text-gray-800';
    if (percentage >= 80) return 'bg-green-100 text-green-800';
    if (percentage >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Team Skills Overview</h1>
          <p className="text-muted-foreground mt-1">
            Track employee skills and identify gaps based on position requirements
          </p>
        </div>
        <Button onClick={fetchEmployeeSkills} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-foreground">
              {employees.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Employees</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-foreground">
              {employees.filter(e => e.has_cv && e.analysis_status === 'completed').length}
            </div>
            <div className="text-sm text-muted-foreground">CVs Analyzed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-foreground">
              {employees.filter(e => e.match_percentage !== null).length > 0
                ? Math.round(
                    employees
                      .filter(e => e.match_percentage !== null)
                      .reduce((sum, e) => sum + (e.match_percentage || 0), 0) /
                    employees.filter(e => e.match_percentage !== null).length
                  )
                : 0}%
            </div>
            <div className="text-sm text-muted-foreground">Avg Skills Match</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder="Search by name, email, or position..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Employee Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium text-muted-foreground">Employee</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Position</th>
                  <th className="text-center p-4 font-medium text-muted-foreground">CV Status</th>
                  <th className="text-center p-4 font-medium text-muted-foreground">Skills Match</th>
                  <th className="text-center p-4 font-medium text-muted-foreground">Gap Summary</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <React.Fragment key={employee.id}>
                    <tr className="border-b hover:bg-muted/30 cursor-pointer"
                        onClick={() => toggleRowExpansion(employee.id)}>
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-foreground">{employee.name}</div>
                          <div className="text-sm text-muted-foreground">{employee.email}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">{employee.position_title}</div>
                        <div className="text-xs text-muted-foreground">{employee.position_code}</div>
                      </td>
                      <td className="p-4 text-center">
                        {employee.has_cv ? (
                          <Badge className="bg-green-100 text-green-800">
                            <FileText className="h-3 w-3 mr-1" />
                            Uploaded
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCVUpload(employee.id);
                            }}
                          >
                            <Upload className="h-3 w-3 mr-1" />
                            Upload CV
                          </Button>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {employee.match_percentage !== null ? (
                          <div className="flex items-center justify-center gap-2">
                            <Badge className={getMatchBadgeColor(employee.match_percentage)}>
                              {employee.match_percentage}%
                            </Badge>
                            <div className="text-xs text-muted-foreground">
                              {employee.matched_skills}/{employee.total_required_skills}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {employee.skill_gaps.length > 0 ? (
                          <div className="flex items-center justify-center gap-1">
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                            <span className="text-sm">
                              {employee.skill_gaps.length} missing skills
                            </span>
                          </div>
                        ) : employee.match_percentage === 100 ? (
                          <Badge className="bg-green-100 text-green-800">All skills met</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        {expandedRows.has(employee.id) ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </td>
                    </tr>
                    
                    {/* Expanded Row */}
                    {expandedRows.has(employee.id) && employee.skill_gaps.length > 0 && (
                      <tr>
                        <td colSpan={6} className="p-0">
                          <div className="bg-muted/20 p-6 border-b">
                            <h4 className="font-medium text-foreground mb-4">
                              Skills Gap Analysis for {employee.position_title}
                            </h4>
                            <div className="space-y-3">
                              {employee.skill_gaps.map((gap, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                                  <div>
                                    <div className="font-medium text-foreground">{gap.skill_name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      Required: Level {gap.required_level} • Current: Level {gap.current_level}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Progress 
                                      value={(gap.current_level / gap.required_level) * 100} 
                                      className="w-24 h-2"
                                    />
                                    <Badge variant="outline" className="text-xs">
                                      Gap: {gap.required_level - gap.current_level}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* CV Upload Dialog */}
      {showCVUpload && uploadEmployeeId && (
        <CVUploadDialog
          employee={{
            id: uploadEmployeeId,
            name: employees.find(e => e.id === uploadEmployeeId)?.name || '',
            email: employees.find(e => e.id === uploadEmployeeId)?.email || ''
          }}
          open={showCVUpload}
          onOpenChange={setShowCVUpload}
          onUploadComplete={() => {
            setShowCVUpload(false);
            setUploadEmployeeId(null);
            fetchEmployeeSkills();
          }}
        />
      )}
    </div>
  );
}