import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Target, 
  AlertTriangle, 
  Lightbulb,
  ArrowRight,
  BookOpen,
  Sparkles,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SkillsGapSectionProps {
  employee: {
    current_position_title?: string;
    target_position_title?: string;
    current_position_id?: string;
    target_position_id?: string;
    skills_profile?: {
      extracted_skills: Array<{
        skill_name: string;
        proficiency_level: number;
      }>;
    };
  };
}

interface RequiredSkill {
  skill_id: string;
  skill_name: string;
  skill_type: string;
  is_mandatory: boolean;
  proficiency_level: number;
}

export function SkillsGapSection({ employee }: SkillsGapSectionProps) {
  const [loading, setLoading] = useState(false);
  const [requiredSkills, setRequiredSkills] = useState<RequiredSkill[]>([]);
  const [positionDetails, setPositionDetails] = useState<any>(null);

  useEffect(() => {
    if (employee.current_position_id || employee.target_position_id) {
      fetchPositionSkills();
    }
  }, [employee.current_position_id, employee.target_position_id]);

  const fetchPositionSkills = async () => {
    setLoading(true);
    try {
      // Use target position if different, otherwise use current position
      const positionId = employee.target_position_id || employee.current_position_id;
      
      if (!positionId) return;

      const { data, error } = await supabase
        .from('st_company_positions')
        .select('*')
        .eq('id', positionId)
        .single();

      if (error) throw error;

      setPositionDetails(data);
      setRequiredSkills(data.required_skills || []);
    } catch (error) {
      console.error('Error fetching position skills:', error);
      toast.error('Failed to load position requirements');
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Skills Gap Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentSkills = employee.skills_profile?.extracted_skills || [];
  const hasTargetPosition = employee.target_position_id && employee.target_position_id !== employee.current_position_id;
  
  // Calculate skill gaps based on database required skills
  const skillGaps = requiredSkills.map(required => {
    const currentSkill = currentSkills.find(
      s => s.skill_name.toLowerCase().includes(required.skill_name.toLowerCase()) ||
           required.skill_name.toLowerCase().includes(s.skill_name.toLowerCase())
    );
    
    return {
      ...required,
      currentLevel: currentSkill?.proficiency_level || 0,
      gap: required.proficiency_level - (currentSkill?.proficiency_level || 0)
    };
  }).filter(s => s.gap > 0);

  const getPriorityColor = (isMandatory: boolean) => {
    return isMandatory ? 'destructive' : 'default';
  };

  const getPriorityIcon = (isMandatory: boolean) => {
    if (isMandatory) {
      return <AlertTriangle className="h-3 w-3" />;
    }
    return null;
  };

  if (!positionDetails && !loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Skills Gap Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              No position requirements found. Please ensure positions have required skills configured.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Skills Gap Analysis
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Sparkles className="h-4 w-4 mr-1" />
              Generate Learning Plan
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Position Info */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">
            {hasTargetPosition ? 'Target Position' : 'Current Position Requirements'}
          </p>
          <p className="font-semibold text-lg">
            {hasTargetPosition ? employee.target_position_title : employee.current_position_title}
          </p>
          {positionDetails && (
            <p className="text-sm text-muted-foreground mt-1">
              {requiredSkills.length} skills required • {requiredSkills.filter(s => s.is_mandatory).length} mandatory
            </p>
          )}
        </div>

        {/* Skills Gap List */}
        {skillGaps.length > 0 ? (
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">
              Skills to Develop for {hasTargetPosition ? employee.target_position_title : employee.current_position_title}
            </h4>
            <div className="space-y-3">
              {skillGaps.map((skill, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant={getPriorityColor(skill.is_mandatory)}>
                      <span className="flex items-center gap-1">
                        {getPriorityIcon(skill.is_mandatory)}
                        {skill.is_mandatory ? 'Mandatory' : 'Optional'}
                      </span>
                    </Badge>
                    <div>
                      <p className="font-medium">{skill.skill_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Current: {skill.currentLevel}/5 → Required: {skill.proficiency_level}/5
                        <span className="ml-2 text-xs">({skill.skill_type})</span>
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <BookOpen className="h-4 w-4 mr-1" />
                    Find Courses
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : requiredSkills.length > 0 ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Excellent! This employee meets all skill requirements for {hasTargetPosition ? 'the target' : 'their current'} position.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              No skill requirements defined for this position yet.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          <Button className="flex-1" variant="default">
            <BookOpen className="h-4 w-4 mr-2" />
            Assign Courses
          </Button>
          <Button className="flex-1" variant="outline">
            <ArrowRight className="h-4 w-4 mr-2" />
            Create Learning Path
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}