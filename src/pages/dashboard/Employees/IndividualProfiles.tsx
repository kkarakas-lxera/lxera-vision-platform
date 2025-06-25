
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Search, User, Mail, Building, Briefcase, TrendingUp, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface EmployeeProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  department: string;
  position: string;
  current_position_title: string;
  target_position_title: string;
  skills_count: number;
  avg_proficiency: number;
  skills_match_score: number;
  last_analyzed: string;
  top_skills: { skill_name: string; proficiency_level: number; }[];
}

export default function IndividualProfiles() {
  const { userProfile } = useAuth();
  const [profiles, setProfiles] = useState<EmployeeProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<EmployeeProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployeeProfiles();
  }, [userProfile?.company_id]);

  useEffect(() => {
    const filtered = profiles.filter(profile =>
      profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.position?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProfiles(filtered);
  }, [profiles, searchTerm]);

  const fetchEmployeeProfiles = async () => {
    if (!userProfile?.company_id) return;

    try {
      const { data, error } = await supabase
        .from('employees')
        .select(`
          id,
          user_id,
          department,
          position,
          users!inner(full_name, email),
          st_employee_skills_profile(
            skills_match_score,
            career_readiness_score,
            analyzed_at,
            extracted_skills
          ),
          st_company_positions!employees_current_position_id_fkey(position_title),
          st_company_positions!employees_target_position_id_fkey(position_title)
        `)
        .eq('company_id', userProfile.company_id)
        .eq('is_active', true);

      if (error) throw error;

      // Transform the data with proper type handling
      const transformedProfiles: EmployeeProfile[] = (data || []).map(emp => {
        const skillsProfile = emp.st_employee_skills_profile?.[0];
        const extractedSkills = skillsProfile?.extracted_skills || [];
        
        // Safely parse extracted skills
        const topSkills = extractedSkills.slice(0, 5).map((skill: any) => {
          if (typeof skill === 'object' && skill !== null) {
            return {
              skill_name: skill.skill_name || 'Unknown Skill',
              proficiency_level: skill.proficiency_level || 0
            };
          }
          return {
            skill_name: 'Unknown Skill',
            proficiency_level: 0
          };
        });

        const avgProficiency = topSkills.length > 0 
          ? topSkills.reduce((sum, skill) => sum + skill.proficiency_level, 0) / topSkills.length
          : 0;

        return {
          id: emp.id,
          user_id: emp.user_id,
          full_name: emp.users.full_name,
          email: emp.users.email,
          department: emp.department || 'Not assigned',
          position: emp.position || 'Not assigned',
          current_position_title: emp.st_company_positions?.[0]?.position_title || 'Not set',
          target_position_title: emp.st_company_positions?.[1]?.position_title || 'Not set',
          skills_count: extractedSkills.length,
          avg_proficiency: Math.round(avgProficiency),
          skills_match_score: Math.round(skillsProfile?.skills_match_score || 0),
          last_analyzed: skillsProfile?.analyzed_at || 'Never',
          top_skills: topSkills
        };
      });

      setProfiles(transformedProfiles);
    } catch (error) {
      console.error('Error fetching employee profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Individual Profiles</h1>
        <p className="text-muted-foreground">
          Detailed view of each team member's skills and career progression
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Employee Profiles Grid */}
      <div className="grid gap-6">
        {filteredProfiles.map((profile) => (
          <Card key={profile.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="" />
                    <AvatarFallback>
                      {profile.full_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{profile.full_name}</CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {profile.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {profile.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {profile.position}
                      </span>
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={profile.skills_match_score > 70 ? 'default' : 'secondary'}>
                  {profile.skills_match_score}% Match
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Career Progression */}
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Career Path
                </h4>
                <div className="flex items-center gap-2 text-sm">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    {profile.current_position_title}
                  </span>
                  <span>→</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                    {profile.target_position_title}
                  </span>
                </div>
              </div>

              {/* Skills Overview */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Skills Profile</h4>
                  <span className="text-sm text-muted-foreground">
                    {profile.skills_count} skills identified
                  </span>
                </div>
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Average Proficiency</span>
                      <span>{profile.avg_proficiency}/5</span>
                    </div>
                    <Progress value={(profile.avg_proficiency / 5) * 100} className="h-2" />
                  </div>
                </div>
                
                {/* Top Skills */}
                <div className="flex flex-wrap gap-2">
                  {profile.top_skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill.skill_name} ({skill.proficiency_level}/5)
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Last Analysis */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                <Calendar className="h-3 w-3" />
                <span>
                  Last analyzed: {
                    profile.last_analyzed === 'Never' 
                      ? 'Never' 
                      : new Date(profile.last_analyzed).toLocaleDateString()
                  }
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProfiles.length === 0 && !loading && (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No employees found
          </h3>
          <p className="text-muted-foreground">
            {searchTerm ? 'Try adjusting your search terms' : 'No employee profiles available yet'}
          </p>
        </div>
      )}
    </div>
  );
}
