import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  RefreshCw, 
  FileText, 
  Calendar,
  ChevronDown,
  ChevronUp,
  Code,
  Users,
  Award,
  Globe
} from 'lucide-react';

interface Skill {
  skill_id: string;
  skill_name: string;
  proficiency_level: number;
  skill_type?: string;
  category?: string;
  years_experience?: number;
}

interface SkillsProfileSectionProps {
  employee: {
    cv_file_path?: string;
    skills_profile?: {
      analyzed_at: string;
      extracted_skills: Skill[];
      experience_years?: number;
      education_level?: string;
      certifications?: any[];
      languages?: any[];
      cv_summary?: string;
    };
  };
  onRefresh: () => void;
  refreshing: boolean;
}

export function SkillsProfileSection({ employee, onRefresh, refreshing }: SkillsProfileSectionProps) {
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [activeTab, setActiveTab] = useState('technical');

  if (!employee.skills_profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Skills Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No skills analysis available. Upload and analyze a CV to generate skills profile.
            </p>
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Upload CV
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { skills_profile } = employee;
  const technicalSkills = skills_profile.extracted_skills.filter(
    s => s.category === 'technical' || s.skill_type === 'technical'
  );
  const softSkills = skills_profile.extracted_skills.filter(
    s => s.category === 'soft' || s.skill_type === 'soft'
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getProficiencyLabel = (level: number) => {
    if (level >= 5) return 'Expert';
    if (level >= 4) return 'Advanced';
    if (level >= 3) return 'Intermediate';
    if (level >= 2) return 'Basic';
    return 'Beginner';
  };

  const renderSkillBar = (skill: Skill) => (
    <div key={skill.skill_id || skill.skill_name} className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{skill.skill_name}</span>
        <span className="text-xs text-muted-foreground">
          {getProficiencyLabel(skill.proficiency_level)}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Progress 
          value={(skill.proficiency_level / 5) * 100} 
          className="h-2 flex-1" 
        />
        <span className="text-xs text-muted-foreground w-8">
          {skill.proficiency_level}/5
        </span>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Skills Profile</CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Last analyzed: {formatDate(skills_profile.analyzed_at)}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
              Re-analyze
            </Button>
            {employee.cv_file_path && (
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-1" />
                View CV
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Skills Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="technical" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Technical Skills ({technicalSkills.length})
            </TabsTrigger>
            <TabsTrigger value="soft" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Soft Skills ({softSkills.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="technical" className="space-y-3 mt-4">
            {technicalSkills.length > 0 ? (
              <>
                {technicalSkills.slice(0, showAllSkills ? undefined : 5).map(renderSkillBar)}
                {technicalSkills.length > 5 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllSkills(!showAllSkills)}
                    className="w-full"
                  >
                    {showAllSkills ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-1" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-1" />
                        Show {technicalSkills.length - 5} More Skills
                      </>
                    )}
                  </Button>
                )}
              </>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No technical skills identified
              </p>
            )}
          </TabsContent>

          <TabsContent value="soft" className="space-y-3 mt-4">
            {softSkills.length > 0 ? (
              softSkills.map(renderSkillBar)
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No soft skills identified
              </p>
            )}
          </TabsContent>
        </Tabs>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
          {skills_profile.experience_years !== undefined && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Experience</p>
              <p className="font-medium">{skills_profile.experience_years} years</p>
            </div>
          )}
          
          {skills_profile.education_level && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Education</p>
              <p className="font-medium">{skills_profile.education_level}</p>
            </div>
          )}
          
          {skills_profile.languages && skills_profile.languages.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Globe className="h-3 w-3" />
                Languages
              </p>
              <div className="flex flex-wrap gap-1">
                {skills_profile.languages.map((lang: any, idx: number) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {typeof lang === 'string' ? lang : lang.name || lang.language}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {skills_profile.certifications && skills_profile.certifications.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Award className="h-3 w-3" />
                Certifications
              </p>
              <div className="flex flex-wrap gap-1">
                {skills_profile.certifications.map((cert: any, idx: number) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {typeof cert === 'string' ? cert : cert.name || cert.title}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}