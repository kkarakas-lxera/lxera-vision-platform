import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  ArrowLeft,
  ChevronRight,
  User
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface AnalyzedEmployee {
  employee_id: string;
  employee_name: string;
  position_id: string;
  position_title: string;
  skills_match_score: number;
  analyzed_at: string;
  skills: string[];
}

export default function AnalyzedEmployees() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<AnalyzedEmployee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<AnalyzedEmployee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<string>('all');
  const [positions, setPositions] = useState<Array<{ id: string; title: string }>>([]);

  useEffect(() => {
    if (userProfile?.company_id) {
      fetchAnalyzedEmployees();
    }
  }, [userProfile]);

  useEffect(() => {
    filterEmployees();
  }, [searchQuery, selectedPosition, employees]);

  const fetchAnalyzedEmployees = async () => {
    if (!userProfile?.company_id) return;

    try {
      // Get positions first
      const { data: positionsData } = await supabase
        .from('st_company_positions')
        .select('id, position_title')
        .eq('company_id', userProfile.company_id);

      if (positionsData) {
        setPositions(positionsData.map(p => ({ id: p.id, title: p.position_title })));
      }

      // Get analyzed employees with their skills profiles
      const { data: skillsProfiles } = await supabase
        .from('st_employee_skills_profile')
        .select(`
          employee_id,
          skills_match_score,
          analyzed_at,
          extracted_skills,
          employees!inner(
            id,
            full_name,
            current_position_id,
            company_id
          )
        `)
        .eq('employees.company_id', userProfile.company_id)
        .not('analyzed_at', 'is', null)
        .order('analyzed_at', { ascending: false });

      if (skillsProfiles) {
        const analyzedEmployees = skillsProfiles.map(profile => {
          const position = positionsData?.find(p => p.id === profile.employees.current_position_id);
          
          // Extract skills array
          let skills: string[] = [];
          if (Array.isArray(profile.extracted_skills)) {
            skills = profile.extracted_skills.map(skill => {
              if (typeof skill === 'string') return skill;
              if (skill?.skill_name) return skill.skill_name;
              return '';
            }).filter(s => s);
          }

          return {
            employee_id: profile.employee_id,
            employee_name: profile.employees.full_name,
            position_id: profile.employees.current_position_id || '',
            position_title: position?.position_title || 'Not Assigned',
            skills_match_score: parseFloat(profile.skills_match_score) || 0,
            analyzed_at: profile.analyzed_at,
            skills: skills.slice(0, 5) // Show top 5 skills
          };
        });

        setEmployees(analyzedEmployees);
        setFilteredEmployees(analyzedEmployees);
      }
    } catch (error) {
      console.error('Error fetching analyzed employees:', error);
      toast({
        title: 'Error',
        description: 'Failed to load employee data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterEmployees = () => {
    let filtered = [...employees];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(emp => 
        emp.employee_name.toLowerCase().includes(query) ||
        emp.skills.some(skill => skill.toLowerCase().includes(query))
      );
    }

    // Filter by position
    if (selectedPosition !== 'all') {
      filtered = filtered.filter(emp => emp.position_id === selectedPosition);
    }

    setFilteredEmployees(filtered);
  };

  const getMatchBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'outline';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-full" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/dashboard/skills')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analyzed Employees</h1>
          <p className="text-muted-foreground mt-1">
            {employees.length} employees with skills analysis
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedPosition}
          onChange={(e) => setSelectedPosition(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background"
        >
          <option value="all">All Positions</option>
          {positions.map(pos => (
            <option key={pos.id} value={pos.id}>{pos.title}</option>
          ))}
        </select>
      </div>

      {/* Employee List */}
      <div className="space-y-4">
        {filteredEmployees.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery || selectedPosition !== 'all' 
                  ? 'No employees match your filters'
                  : 'No analyzed employees yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredEmployees.map((employee) => (
            <Card key={employee.employee_id} className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/dashboard/employees/${employee.employee_id}`)}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div>
                      <h3 className="font-semibold text-lg">{employee.employee_name}</h3>
                      <p className="text-sm text-muted-foreground">{employee.position_title}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <Badge variant={getMatchBadgeVariant(employee.skills_match_score)}>
                        {Math.round(employee.skills_match_score)}% match
                      </Badge>
                      <span className="text-muted-foreground">
                        Analyzed {formatDate(employee.analyzed_at)}
                      </span>
                    </div>

                    {employee.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {employee.skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {employee.skills.length === 5 && (
                          <span className="text-xs text-muted-foreground">+more</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-4">
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard/skills')}
        >
          Back to Overview
        </Button>
        <Button
          onClick={() => navigate('/dashboard/onboarding')}
        >
          Analyze More Employees
        </Button>
      </div>
    </div>
  );
}