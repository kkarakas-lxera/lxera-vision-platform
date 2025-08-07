import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SkillBadgeProps {
  skill: {
    skill_name: string;
    proficiency_level?: number;
    confidence?: number;
    is_custom?: boolean;
    is_mandatory?: boolean;
  };
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  showProficiency?: boolean;
  showConfidence?: boolean;
  className?: string;
}

export function SkillBadge({
  skill,
  variant = 'default',
  size = 'md',
  showProficiency = false,
  showConfidence = false,
  className
}: SkillBadgeProps) {
  const getProficiencyColor = (level: number) => {
    // Standard 0-3 scale: 0=None, 1=Learning, 2=Using, 3=Expert
    if (level === 3) return 'bg-blue-500';   // Expert
    if (level === 2) return 'bg-green-500';  // Using
    if (level === 1) return 'bg-yellow-500'; // Learning
    return 'bg-gray-500';                     // None (0)
  };

  const getProficiencyLabel = (level: number) => {
    // Standard 0-3 scale labels
    const labels = ['None', 'Learning', 'Using', 'Expert'];
    return labels[level] || 'Unknown';
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Badge 
        variant={skill.is_custom ? 'outline' : variant}
        className={cn(
          sizeClasses[size],
          skill.is_mandatory && 'border-orange-500',
          skill.is_custom && 'border-dashed'
        )}
      >
        {skill.skill_name}
        {skill.is_mandatory && <span className="ml-1 text-orange-500">*</span>}
        {skill.is_custom && <span className="ml-1 text-muted-foreground">(custom)</span>}
      </Badge>
      
      {showProficiency && skill.proficiency_level !== undefined && (
        <div className="flex items-center gap-1">
          <div 
            className={cn(
              'w-2 h-2 rounded-full',
              getProficiencyColor(skill.proficiency_level)
            )}
            title={getProficiencyLabel(skill.proficiency_level)}
          />
          {size === 'lg' && (
            <span className="text-xs text-muted-foreground">
              {getProficiencyLabel(skill.proficiency_level)}
            </span>
          )}
        </div>
      )}
      
      {showConfidence && skill.confidence !== undefined && (
        <span className="text-xs text-muted-foreground">
          {Math.round(skill.confidence * 100)}%
        </span>
      )}
    </div>
  );
}