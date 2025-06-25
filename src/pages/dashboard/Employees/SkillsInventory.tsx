import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  Database, 
  Search,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Users,
  TrendingUp,
  Award,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DepartmentView } from './SkillsInventory/DepartmentView';
import { SkillsView } from './SkillsInventory/SkillsView';
import { PeopleView } from './SkillsInventory/PeopleView';
import { MatrixView } from './SkillsInventory/MatrixView';

interface DepartmentSkills {
  department: string;
  employeeCount: number;
  skillsCount: number;
  coverage: number;
  topSkills: Array<{
    skill_name: string;
    count: number;
    avgProficiency: number;
  }>;
}

export function SkillsInventory() {
  const { userProfile } = useAuth();
  const [activeView, setActiveView] = useState('departments');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentData, setDepartmentData] = useState<DepartmentSkills[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalEmployees: 0,
    totalSkills: 0,
    avgCoverage: 0
  });

  useEffect(() => {
    if (userProfile?.company_id) {
      fetchSkillsData();
    }
  }, [userProfile]);

  const fetchSkillsData = async () => {
    if (!userProfile?.company_id) return;

    try {
      setLoading(true);

      // Fetch all employees with their skills
      const { data: employeesWithSkills } = await supabase
        .from('employees')
        .select(`
          *,
          users!inner(full_name, email),
          st_employee_skills_profile!left(
            extracted_skills,
            skills_match_score
          )
        `)
        .eq('company_id', userProfile.company_id)
        .eq('is_active', true);

      if (!employeesWithSkills) return;

      // Process data by department
      const deptMap = new Map<string, DepartmentSkills>();
      const allSkills = new Set<string>();
      let totalEmployees = 0;

      employeesWithSkills.forEach(emp => {
        const dept = emp.department || 'Unassigned';
        totalEmployees++;

        if (!deptMap.has(dept)) {
          deptMap.set(dept, {
            department: dept,
            employeeCount: 0,
            skillsCount: 0,
            coverage: 0,
            topSkills: []
          });
        }

        const deptData = deptMap.get(dept)!;
        deptData.employeeCount++;

        // Process skills if available
        if (emp.st_employee_skills_profile?.[0]?.extracted_skills) {
          const skills = emp.st_employee_skills_profile[0].extracted_skills;
          const skillMap = new Map();

          skills.forEach((skill: any) => {
            if (skill.skill_name) {
              allSkills.add(skill.skill_name);
              
              if (!skillMap.has(skill.skill_name)) {
                skillMap.set(skill.skill_name, {
                  skill_name: skill.skill_name,
                  count: 0,
                  totalProficiency: 0
                });
              }
              
              const s = skillMap.get(skill.skill_name);
              s.count++;
              s.totalProficiency += skill.proficiency_level || 3;
            }
          });

          // Update department skills
          deptData.skillsCount = skillMap.size;
          deptData.topSkills = Array.from(skillMap.values())
            .map(s => ({
              skill_name: s.skill_name,
              count: s.count,
              avgProficiency: s.totalProficiency / s.count
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        }
      });

      // Calculate coverage for each department
      deptMap.forEach((dept, key) => {
        const employeesWithSkills = employeesWithSkills.filter(
          e => (e.department || 'Unassigned') === key && 
               e.st_employee_skills_profile?.length > 0
        ).length;
        dept.coverage = dept.employeeCount > 0 
          ? Math.round((employeesWithSkills / dept.employeeCount) * 100)
          : 0;
      });

      const deptArray = Array.from(deptMap.values());
      const avgCoverage = deptArray.length > 0
        ? Math.round(deptArray.reduce((sum, d) => sum + d.coverage, 0) / deptArray.length)
        : 0;

      setDepartmentData(deptArray);
      setTotalStats({
        totalEmployees,
        totalSkills: allSkills.size,
        avgCoverage
      });

    } catch (error) {
      console.error('Error fetching skills data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    // Convert data to CSV format
    const headers = ['Department', 'Employees', 'Skills Count', 'Coverage %'];
    const rows = departmentData.map(dept => [
      dept.department,
      dept.employeeCount,
      dept.skillsCount,
      dept.coverage
    ]);
    
    const csv = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
    
    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `skills-inventory-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{totalStats.totalEmployees}</p>
                <p className="text-sm text-muted-foreground">Total Employees</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{totalStats.totalSkills}</p>
                <p className="text-sm text-muted-foreground">Unique Skills</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{totalStats.avgCoverage}%</p>
                <p className="text-sm text-muted-foreground">Avg Coverage</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="h-5 w-5" />
                Skills Inventory
              </CardTitle>
              <CardDescription>
                Comprehensive view of skills across your organization
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={fetchSkillsData}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
              <Button size="sm" variant="outline" onClick={exportData}>
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button size="sm" variant="outline">
                <Settings className="h-4 w-4 mr-1" />
                Manage Skills
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search skills, departments, or people..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* View Tabs */}
          <Tabs value={activeView} onValueChange={setActiveView}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="departments">Departments</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="people">People</TabsTrigger>
              <TabsTrigger value="matrix">Matrix</TabsTrigger>
            </TabsList>

            <TabsContent value="departments" className="mt-4">
              <DepartmentView 
                data={departmentData} 
                loading={loading}
                searchTerm={searchTerm}
              />
            </TabsContent>

            <TabsContent value="skills" className="mt-4">
              <SkillsView 
                companyId={userProfile?.company_id || ''}
                searchTerm={searchTerm}
              />
            </TabsContent>

            <TabsContent value="people" className="mt-4">
              <PeopleView 
                companyId={userProfile?.company_id || ''}
                searchTerm={searchTerm}
              />
            </TabsContent>

            <TabsContent value="matrix" className="mt-4">
              <MatrixView 
                companyId={userProfile?.company_id || ''}
                searchTerm={searchTerm}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}