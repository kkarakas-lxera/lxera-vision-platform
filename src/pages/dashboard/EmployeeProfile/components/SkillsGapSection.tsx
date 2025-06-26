import React from 'react';
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
  CheckCircle
} from 'lucide-react';

interface SkillsGapSectionProps {
  employee: {
    current_position_title?: string;
    target_position_title?: string;
    skills_profile?: {
      extracted_skills: Array<{
        skill_name: string;
        proficiency_level: number;
      }>;
    };
  };
}

// Mock data for skills required for target position
// In a real app, this would come from the database
const getTargetPositionSkills = (position: string) => {
  const skillSets: Record<string, Array<{ name: string; requiredLevel: number; priority: 'high' | 'medium' | 'low' }>> = {
    'Tech Lead': [
      { name: 'System Design', requiredLevel: 4, priority: 'high' },
      { name: 'Team Management', requiredLevel: 4, priority: 'high' },
      { name: 'Architecture Patterns', requiredLevel: 4, priority: 'high' },
      { name: 'Kubernetes', requiredLevel: 3, priority: 'medium' },
      { name: 'Mentoring', requiredLevel: 3, priority: 'medium' },
      { name: 'Agile Methodologies', requiredLevel: 4, priority: 'low' }
    ],
    'Senior Software Engineer': [
      { name: 'Advanced Programming', requiredLevel: 4, priority: 'high' },
      { name: 'System Design', requiredLevel: 3, priority: 'high' },
      { name: 'Cloud Architecture', requiredLevel: 3, priority: 'medium' },
      { name: 'DevOps', requiredLevel: 3, priority: 'medium' }
    ]
  };

  return skillSets[position] || [];
};

export function SkillsGapSection({ employee }: SkillsGapSectionProps) {
  if (!employee.target_position_title || employee.target_position_title === employee.current_position_title) {
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
              Set a target position to see skills gap analysis and get personalized recommendations.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const currentSkills = employee.skills_profile?.extracted_skills || [];
  const requiredSkills = getTargetPositionSkills(employee.target_position_title);
  
  // Calculate skill gaps
  const skillGaps = requiredSkills.map(required => {
    const currentSkill = currentSkills.find(
      s => s.skill_name.toLowerCase().includes(required.name.toLowerCase()) ||
           required.name.toLowerCase().includes(s.skill_name.toLowerCase())
    );
    
    return {
      ...required,
      currentLevel: currentSkill?.proficiency_level || 0,
      gap: required.requiredLevel - (currentSkill?.proficiency_level || 0)
    };
  }).filter(s => s.gap > 0);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === 'high') {
      return <AlertTriangle className="h-3 w-3" />;
    }
    return null;
  };

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
        {/* Target Position */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Target Position</p>
          <p className="font-semibold text-lg">{employee.target_position_title}</p>
        </div>

        {/* Skills Gap List */}
        {skillGaps.length > 0 ? (
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">
              Missing Skills for {employee.target_position_title}
            </h4>
            <div className="space-y-3">
              {skillGaps.map((skill, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant={getPriorityColor(skill.priority)}>
                      <span className="flex items-center gap-1">
                        {getPriorityIcon(skill.priority)}
                        {skill.priority} priority
                      </span>
                    </Badge>
                    <div>
                      <p className="font-medium">{skill.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Current: {skill.currentLevel}/5 → Required: {skill.requiredLevel}/5
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
        ) : (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Great! This employee already has all the required skills for the target position.
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