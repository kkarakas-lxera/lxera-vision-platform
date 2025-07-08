import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Users,
  Target,
  TrendingUp,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  BookOpen,
  Award,
  Share2
} from 'lucide-react';
import { MobileProgressBar } from './MobileProgressBar';
import { cn } from '@/lib/utils';

interface SkillGap {
  skill_name: string;
  skill_type: string;
  required_level: string;
  current_level: string | null;
  gap_severity: 'critical' | 'important' | 'minor';
  employees_affected: number;
  proficiency_gap?: number;
  impact_score?: number;
}

interface PositionAnalysis {
  position_title: string;
  position_code: string;
  total_employees: number;
  avg_gap_score: number;
  critical_gaps: number;
  top_gaps: SkillGap[];
}

interface MobileSkillsGapDetailProps {
  position: PositionAnalysis;
  onBack: () => void;
  onStartTraining?: (skillName: string) => void;
  onShareReport?: () => void;
}

export const MobileSkillsGapDetail: React.FC<MobileSkillsGapDetailProps> = ({
  position,
  onBack,
  onStartTraining,
  onShareReport
}) => {
  const [selectedTab, setSelectedTab] = useState<'gaps' | 'recommendations' | 'progress'>('gaps');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'important':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'minor':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />;
      case 'important':
        return <Info className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getRecommendations = (gap: SkillGap) => {
    const recommendations = [];
    
    if (gap.gap_severity === 'critical') {
      recommendations.push({
        type: 'immediate',
        title: 'Immediate Training Required',
        description: 'Schedule mandatory training sessions for all affected employees',
        icon: <AlertTriangle className="h-4 w-4 text-red-600" />,
        priority: 'high'
      });
    }
    
    recommendations.push({
      type: 'course',
      title: 'Recommended Course',
      description: `${gap.skill_name} fundamentals and advanced techniques`,
      icon: <BookOpen className="h-4 w-4 text-blue-600" />,
      priority: gap.gap_severity === 'critical' ? 'high' : 'medium'
    });
    
    recommendations.push({
      type: 'mentorship',
      title: 'Pair with Expert',
      description: 'Match with employees who have strong skills in this area',
      icon: <Users className="h-4 w-4 text-green-600" />,
      priority: 'medium'
    });
    
    return recommendations;
  };

  const TabButton = ({ tab, label, isActive, onClick }: { 
    tab: string; 
    label: string; 
    isActive: boolean; 
    onClick: () => void; 
  }) => (
    <Button
      variant={isActive ? 'default' : 'ghost'}
      size="sm"
      onClick={onClick}
      className="flex-1 text-xs"
    >
      {label}
    </Button>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <CardTitle className="text-lg">{position.position_title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {position.total_employees} employees • {position.avg_gap_score}% skills match
              </p>
            </div>
            {onShareReport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onShareReport}
                className="h-8 w-8 p-0"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Overall Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Skills Match</span>
              <span className="text-2xl font-bold text-blue-600">
                {position.avg_gap_score}%
              </span>
            </div>
            <MobileProgressBar
              value={position.avg_gap_score}
              size="lg"
              showValue={false}
            />
            <div className="grid grid-cols-3 gap-3 pt-2 border-t">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Total Gaps</p>
                <p className="text-lg font-semibold">{position.top_gaps.length}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Critical</p>
                <p className="text-lg font-semibold text-red-600">{position.critical_gaps}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Employees</p>
                <p className="text-lg font-semibold">{position.total_employees}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <Card>
        <CardContent className="p-3">
          <div className="flex gap-1">
            <TabButton
              tab="gaps"
              label="Skill Gaps"
              isActive={selectedTab === 'gaps'}
              onClick={() => setSelectedTab('gaps')}
            />
            <TabButton
              tab="recommendations"
              label="Actions"
              isActive={selectedTab === 'recommendations'}
              onClick={() => setSelectedTab('recommendations')}
            />
            <TabButton
              tab="progress"
              label="Progress"
              isActive={selectedTab === 'progress'}
              onClick={() => setSelectedTab('progress')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tab Content */}
      {selectedTab === 'gaps' && (
        <div className="space-y-3">
          {position.top_gaps.map((gap, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{gap.skill_name}</h4>
                      <p className="text-sm text-muted-foreground capitalize">
                        {gap.skill_type.replace('_', ' ')}
                      </p>
                    </div>
                    <Badge className={cn("ml-2", getSeverityColor(gap.gap_severity))}>
                      <span className="flex items-center gap-1">
                        {getSeverityIcon(gap.gap_severity)}
                        {gap.gap_severity}
                      </span>
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Required Level</p>
                      <p className="font-medium">{gap.required_level}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Current Level</p>
                      <p className="font-medium">{gap.current_level || 'Not assessed'}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{gap.employees_affected} employees affected</span>
                    </div>
                    {onStartTraining && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onStartTraining(gap.skill_name)}
                        className="text-xs"
                      >
                        <BookOpen className="h-3 w-3 mr-1" />
                        Start Training
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedTab === 'recommendations' && (
        <div className="space-y-3">
          {position.top_gaps.slice(0, 3).map((gap, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{gap.skill_name}</h4>
                    <Badge className={getSeverityColor(gap.gap_severity)}>
                      {gap.gap_severity}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {getRecommendations(gap).map((rec, recIndex) => (
                      <div key={recIndex} className="flex items-start gap-3 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="mt-0.5">{rec.icon}</div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{rec.title}</p>
                          <p className="text-xs text-muted-foreground">{rec.description}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {rec.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedTab === 'progress' && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="text-center">
                <Award className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <h4 className="font-medium">Progress Tracking</h4>
                <p className="text-sm text-muted-foreground">
                  Track training progress and skill development over time
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Training Started</span>
                  </div>
                  <span className="text-sm font-medium">0 employees</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Skills Improved</span>
                  </div>
                  <span className="text-sm font-medium">0 employees</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Goals Achieved</span>
                  </div>
                  <span className="text-sm font-medium">0 employees</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};