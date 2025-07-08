import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  ArrowLeft,
  Download,
  Eye,
  Filter
} from 'lucide-react';
import { MobileSkillsGapOverview } from './MobileSkillsGapOverview';
import { MobileSkillsGapDetail } from './MobileSkillsGapDetail';
import { MobileEmptyState } from './MobileEmptyState';

// Mock data for demonstration
const mockPositions = [
  {
    position_title: 'Frontend Developer',
    position_code: 'FE001',
    total_employees: 12,
    avg_gap_score: 75,
    critical_gaps: 2,
    top_gaps: [
      {
        skill_name: 'React.js',
        skill_type: 'technical',
        required_level: 'Level 4',
        current_level: 'Level 2',
        gap_severity: 'critical' as const,
        employees_affected: 8,
        proficiency_gap: 2
      },
      {
        skill_name: 'TypeScript',
        skill_type: 'technical',
        required_level: 'Level 3',
        current_level: 'Level 1',
        gap_severity: 'important' as const,
        employees_affected: 6,
        proficiency_gap: 2
      },
      {
        skill_name: 'CSS Grid',
        skill_type: 'technical',
        required_level: 'Level 3',
        current_level: 'Level 2',
        gap_severity: 'minor' as const,
        employees_affected: 4,
        proficiency_gap: 1
      }
    ]
  },
  {
    position_title: 'Backend Developer',
    position_code: 'BE001',
    total_employees: 8,
    avg_gap_score: 82,
    critical_gaps: 1,
    top_gaps: [
      {
        skill_name: 'Node.js',
        skill_type: 'technical',
        required_level: 'Level 4',
        current_level: 'Level 3',
        gap_severity: 'important' as const,
        employees_affected: 5,
        proficiency_gap: 1
      },
      {
        skill_name: 'Database Design',
        skill_type: 'technical',
        required_level: 'Level 3',
        current_level: 'Level 2',
        gap_severity: 'critical' as const,
        employees_affected: 3,
        proficiency_gap: 1
      }
    ]
  },
  {
    position_title: 'UX Designer',
    position_code: 'UX001',
    total_employees: 6,
    avg_gap_score: 88,
    critical_gaps: 0,
    top_gaps: [
      {
        skill_name: 'User Research',
        skill_type: 'soft_skill',
        required_level: 'Level 3',
        current_level: 'Level 2',
        gap_severity: 'minor' as const,
        employees_affected: 2,
        proficiency_gap: 1
      }
    ]
  }
];

const mockTopSkillGaps = [
  {
    skill_name: 'React.js',
    skill_type: 'technical',
    required_level: 'Level 4',
    current_level: 'Level 2',
    gap_severity: 'critical' as const,
    employees_affected: 8
  },
  {
    skill_name: 'TypeScript',
    skill_type: 'technical',
    required_level: 'Level 3',
    current_level: 'Level 1',
    gap_severity: 'important' as const,
    employees_affected: 6
  },
  {
    skill_name: 'Node.js',
    skill_type: 'technical',
    required_level: 'Level 4',
    current_level: 'Level 3',
    gap_severity: 'important' as const,
    employees_affected: 5
  },
  {
    skill_name: 'CSS Grid',
    skill_type: 'technical',
    required_level: 'Level 3',
    current_level: 'Level 2',
    gap_severity: 'minor' as const,
    employees_affected: 4
  },
  {
    skill_name: 'Database Design',
    skill_type: 'technical',
    required_level: 'Level 3',
    current_level: 'Level 2',
    gap_severity: 'critical' as const,
    employees_affected: 3
  }
];

type ViewMode = 'overview' | 'detail' | 'empty' | 'loading';

interface MobileSkillsGapShowcaseProps {
  initialView?: ViewMode;
  showControls?: boolean;
}

export const MobileSkillsGapShowcase: React.FC<MobileSkillsGapShowcaseProps> = ({
  initialView = 'overview',
  showControls = true
}) => {
  const [currentView, setCurrentView] = useState<ViewMode>(initialView);
  const [selectedPosition, setSelectedPosition] = useState(mockPositions[0]);
  const [isLoading, setIsLoading] = useState(false);

  const handleExportReport = () => {
    console.log('Exporting skills gap report...');
  };

  const handlePositionSelect = (position: typeof mockPositions[0]) => {
    setSelectedPosition(position);
    setCurrentView('detail');
  };

  const handleStartTraining = (skillName: string) => {
    console.log(`Starting training for ${skillName}`);
  };

  const handleShareReport = () => {
    console.log('Sharing position report...');
  };

  const simulateLoading = () => {
    setIsLoading(true);
    setCurrentView('loading');
    setTimeout(() => {
      setIsLoading(false);
      setCurrentView('overview');
    }, 2000);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'loading':
        return (
          <MobileEmptyState 
            type="loading" 
            title="Analyzing Skills Data"
            description="Please wait while we process employee skills and identify gaps."
          />
        );

      case 'empty':
        return (
          <MobileEmptyState
            type="no-analysis"
            title="No Skills Analysis Available"
            description="Import employees and analyze their CVs to see comprehensive skills gap reports."
            action={{
              label: 'Start Analysis',
              onClick: () => setCurrentView('overview')
            }}
          />
        );

      case 'detail':
        return (
          <MobileSkillsGapDetail
            position={selectedPosition}
            onBack={() => setCurrentView('overview')}
            onStartTraining={handleStartTraining}
            onShareReport={handleShareReport}
          />
        );

      case 'overview':
      default:
        return (
          <MobileSkillsGapOverview
            positions={mockPositions}
            topSkillGaps={mockTopSkillGaps}
            totalEmployees={26}
            analyzedEmployees={24}
            onExportReport={handleExportReport}
            onPositionSelect={handlePositionSelect}
            isLoading={isLoading}
          />
        );
    }
  };

  return (
    <div className="max-w-sm mx-auto bg-gray-50 dark:bg-gray-950 min-h-screen">
      {/* Showcase Controls */}
      {showControls && (
        <Card className="m-4 mb-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Mobile Skills Gap Demo
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={currentView === 'overview' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentView('overview')}
                className="text-xs"
              >
                Overview
              </Button>
              <Button
                variant={currentView === 'detail' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentView('detail')}
                className="text-xs"
              >
                Detail View
              </Button>
              <Button
                variant={currentView === 'empty' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentView('empty')}
                className="text-xs"
              >
                Empty State
              </Button>
              <Button
                variant={currentView === 'loading' ? 'default' : 'outline'}
                size="sm"
                onClick={simulateLoading}
                className="text-xs"
              >
                Loading
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {renderCurrentView()}
      </div>
    </div>
  );
};