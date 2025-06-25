
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Users, Building, BarChart3, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { SkillsView } from './SkillsInventory/SkillsView';
import { PeopleView } from './SkillsInventory/PeopleView';
import { DepartmentView } from './SkillsInventory/DepartmentView';
import { MatrixView } from './SkillsInventory/MatrixView';

interface SkillData {
  skill_id: string;
  skill_name: string;
  employee_count: number;
  avg_proficiency: number;
  departments: string[];
  skill_type: string;
}

interface EmployeeWithSkills {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  skills: Array<{
    skill_id: string;
    skill_name: string;
    proficiency_level: number;
    skill_type: string;
  }>;
  total_skills: number;
  avg_proficiency: number;
}

export default function SkillsInventory() {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('skills');
  const [skillsData, setSkillsData] = useState<SkillData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedSkillType, setSelectedSkillType] = useState<string>('all');

  // Fetch skills data first
  useEffect(() => {
    fetchSkillsData();
  }, [userProfile?.company_id]);

  const fetchSkillsData = async () => {
    if (!userProfile?.company_id) return;

    try {
      setLoading(true);

      // Get all employees with their skills
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select(`
          id,
          department,
          position,
          users!inner(full_name, email),
          st_employee_skills_profile!inner(extracted_skills)
        `)
        .eq('company_id', userProfile.company_id)
        .eq('is_active', true);

      if (employeesError) throw employeesError;

      // Process the data to create skills inventory
      const skillsMap = new Map<string, {
        skill_name: string;
        skill_type: string;
        employees: Set<string>;
        departments: Set<string>;
        proficiency_sum: number;
        proficiency_count: number;
      }>();

      // Declare employeesWithSkills here
      const employeesWithSkills: EmployeeWithSkills[] = [];

      (employeesData || []).forEach(employee => {
        const skillsProfile = employee.st_employee_skills_profile?.[0];
        const extractedSkills = skillsProfile?.extracted_skills || [];

        const employeeSkills: Array<{
          skill_id: string;
          skill_name: string;
          proficiency_level: number;
          skill_type: string;
        }> = [];

        extractedSkills.forEach((skill: any) => {
          if (typeof skill === 'object' && skill !== null && skill.skill_name) {
            const skillKey = skill.skill_id || skill.skill_name;
            const proficiency = skill.proficiency_level || 0;
            const skillType = skill.skill_type || 'technical';

            // Add to skills map
            if (!skillsMap.has(skillKey)) {
              skillsMap.set(skillKey, {
                skill_name: skill.skill_name,
                skill_type: skillType,
                employees: new Set(),
                departments: new Set(),
                proficiency_sum: 0,
                proficiency_count: 0
              });
            }

            const skillData = skillsMap.get(skillKey)!;
            skillData.employees.add(employee.id);
            skillData.departments.add(employee.department || 'Unknown');
            skillData.proficiency_sum += proficiency;
            skillData.proficiency_count += 1;

            // Add to employee skills
            employeeSkills.push({
              skill_id: skillKey,
              skill_name: skill.skill_name,
              proficiency_level: proficiency,
              skill_type: skillType
            });
          }
        });

        // Add employee to the array
        employeesWithSkills.push({
          id: employee.id,
          name: employee.users.full_name,
          email: employee.users.email,
          department: employee.department || 'Unknown',
          position: employee.position || 'Not assigned',
          skills: employeeSkills,
          total_skills: employeeSkills.length,
          avg_proficiency: employeeSkills.length > 0 
            ? employeeSkills.reduce((sum, s) => sum + s.proficiency_level, 0) / employeeSkills.length
            : 0
        });
      });

      // Convert skills map to array
      const skillsArray: SkillData[] = Array.from(skillsMap.entries()).map(([skillId, data]) => ({
        skill_id: skillId,
        skill_name: data.skill_name,
        employee_count: data.employees.size,
        avg_proficiency: data.proficiency_count > 0 ? data.proficiency_sum / data.proficiency_count : 0,
        departments: Array.from(data.departments),
        skill_type: data.skill_type
      }));

      setSkillsData(skillsArray);
      
    } catch (error) {
      console.error('Error fetching skills data:', error);
    } finally {
      setLoading(false);
    }
  };

  const departments = [...new Set(skillsData.flatMap(skill => skill.departments))];
  const skillTypes = [...new Set(skillsData.map(skill => skill.skill_type))];

  const filteredSkills = skillsData.filter(skill => {
    const matchesSearch = skill.skill_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || skill.departments.includes(selectedDepartment);
    const matchesType = selectedSkillType === 'all' || skill.skill_type === selectedSkillType;
    
    return matchesSearch && matchesDepartment && matchesType;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Skills Inventory</h1>
        <p className="text-muted-foreground">
          Comprehensive view of all skills across your organization
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Skills</p>
                <p className="text-2xl font-bold">{skillsData.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Departments</p>
                <p className="text-2xl font-bold">{departments.length}</p>
              </div>
              <Building className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Skill Types</p>
                <p className="text-2xl font-bold">{skillTypes.length}</p>
              </div>
              <Badge className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Proficiency</p>
                <p className="text-2xl font-bold">
                  {skillsData.length > 0 
                    ? (skillsData.reduce((sum, s) => sum + s.avg_proficiency, 0) / skillsData.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedSkillType} onValueChange={setSelectedSkillType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Skill Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {skillTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="skills">Skills View</TabsTrigger>
          <TabsTrigger value="people">People View</TabsTrigger>
          <TabsTrigger value="departments">Department View</TabsTrigger>
          <TabsTrigger value="matrix">Matrix View</TabsTrigger>
        </TabsList>

        <TabsContent value="skills">
          <SkillsView skills={filteredSkills} />
        </TabsContent>

        <TabsContent value="people">
          <PeopleView />
        </TabsContent>

        <TabsContent value="departments">
          <DepartmentView />
        </TabsContent>

        <TabsContent value="matrix">
          <MatrixView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
