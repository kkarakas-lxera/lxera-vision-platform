import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, GraduationCap, Brain, Target, Rocket, Users, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProfileDataReviewProps {
  section: 'work' | 'education' | 'skills' | 'challenges' | 'growth' | 'current_work' | 'all';
  data: any;
  onEdit?: (section: string) => void;
  onClose?: () => void;
}

export default function ProfileDataReview({ 
  section, 
  data, 
  onEdit,
  onClose 
}: ProfileDataReviewProps) {
  
  const renderWorkExperience = () => {
    if (!data.workExperience || data.workExperience.length === 0) {
      return <p className="text-sm text-gray-500">No work experience added yet.</p>;
    }
    
    return (
      <div className="space-y-3">
        {data.workExperience.map((work: any, index: number) => (
          <div key={index} className="p-3 border rounded-md bg-gray-50">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-sm">{work.title}</p>
                <p className="text-xs text-gray-600">{work.company} • {work.duration}</p>
                {work.description && (
                  <p className="text-xs text-gray-700 mt-1">{work.description}</p>
                )}
              </div>
              <Badge variant="secondary" className="text-xs">
                Position {index + 1}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderEducation = () => {
    if (!data.education || data.education.length === 0) {
      return <p className="text-sm text-gray-500">No education added yet.</p>;
    }
    
    return (
      <div className="space-y-3">
        {data.education.map((edu: any, index: number) => (
          <div key={index} className="p-3 border rounded-md bg-gray-50">
            <p className="font-medium text-sm">{edu.degree}</p>
            {edu.fieldOfStudy && <p className="text-xs text-gray-700">{edu.fieldOfStudy}</p>}
            <p className="text-xs text-gray-600">{edu.institution} • {edu.graduationYear}</p>
          </div>
        ))}
      </div>
    );
  };

  const renderSkills = () => {
    if (!data.skills || data.skills.length === 0) {
      return <p className="text-sm text-gray-500">No skills validated yet.</p>;
    }
    
    return (
      <div className="flex flex-wrap gap-2">
        {data.skills.map((skill: any, index: number) => (
          <Badge key={index} variant="secondary" className="text-xs">
            {skill.name || skill} 
            {skill.level && <span className="ml-1">• Level {skill.level}</span>}
          </Badge>
        ))}
      </div>
    );
  };

  const renderChallenges = () => {
    if (!data.challenges || data.challenges.length === 0) {
      return <p className="text-sm text-gray-500">No challenges identified yet.</p>;
    }
    
    return (
      <ul className="space-y-2">
        {data.challenges.map((challenge: string, index: number) => (
          <li key={index} className="flex items-start gap-2">
            <Target className="h-3 w-3 text-gray-400 mt-0.5" />
            <span className="text-sm">{challenge}</span>
          </li>
        ))}
      </ul>
    );
  };

  const renderGrowthAreas = () => {
    if (!data.growthAreas || data.growthAreas.length === 0) {
      return <p className="text-sm text-gray-500">No growth areas identified yet.</p>;
    }
    
    return (
      <ul className="space-y-2">
        {data.growthAreas.map((area: string, index: number) => (
          <li key={index} className="flex items-start gap-2">
            <Rocket className="h-3 w-3 text-gray-400 mt-0.5" />
            <span className="text-sm">{area}</span>
          </li>
        ))}
      </ul>
    );
  };

  const renderCurrentWork = () => {
    return (
      <div className="space-y-2">
        {data.teamSize && (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-sm">Team Size: {data.teamSize}</span>
          </div>
        )}
        {data.roleInTeam && (
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-gray-400" />
            <span className="text-sm">Role: {data.roleInTeam}</span>
          </div>
        )}
        {data.currentProjects && data.currentProjects.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-1">Current Projects:</p>
            <ul className="space-y-1">
              {data.currentProjects.map((project: string, index: number) => (
                <li key={index} className="text-sm text-gray-600 ml-4">• {project}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderAllSections = () => {
    return (
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
            <Briefcase className="h-3.5 w-3.5" /> Work Experience
          </h4>
          {renderWorkExperience()}
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
            <GraduationCap className="h-3.5 w-3.5" /> Education
          </h4>
          {renderEducation()}
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
            <Brain className="h-3.5 w-3.5" /> Skills
          </h4>
          {renderSkills()}
        </div>
        
        {data.challenges && data.challenges.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
              <Target className="h-3.5 w-3.5" /> Challenges
            </h4>
            {renderChallenges()}
          </div>
        )}
        
        {data.growthAreas && data.growthAreas.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
              <Rocket className="h-3.5 w-3.5" /> Growth Areas
            </h4>
            {renderGrowthAreas()}
          </div>
        )}
      </div>
    );
  };

  const sectionConfig = {
    work: {
      title: 'Work Experience',
      icon: Briefcase,
      render: renderWorkExperience
    },
    education: {
      title: 'Education',
      icon: GraduationCap,
      render: renderEducation
    },
    skills: {
      title: 'Skills & Expertise',
      icon: Brain,
      render: renderSkills
    },
    challenges: {
      title: 'Professional Challenges',
      icon: Target,
      render: renderChallenges
    },
    growth: {
      title: 'Growth Opportunities',
      icon: Rocket,
      render: renderGrowthAreas
    },
    current_work: {
      title: 'Current Work Context',
      icon: Users,
      render: renderCurrentWork
    },
    all: {
      title: 'Complete Profile Summary',
      icon: Briefcase,
      render: renderAllSections
    }
  };

  const config = sectionConfig[section];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card className="border-0 shadow-sm">
        <CardHeader className="py-3 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-1.5">
              <Icon className="h-3.5 w-3.5" />
              {config.title}
            </CardTitle>
            <div className="flex gap-2">
              {onEdit && section !== 'all' && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onEdit(section)}
                  className="h-7 text-xs"
                >
                  Edit
                </Button>
              )}
              {onClose && (
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={onClose}
                  className="h-7 text-xs"
                >
                  Close
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {config.render()}
        </CardContent>
      </Card>
    </motion.div>
  );
}