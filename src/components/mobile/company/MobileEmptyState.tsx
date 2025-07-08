import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Users, 
  Upload, 
  Target,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  FileText,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileEmptyStateProps {
  type: 'no-data' | 'no-employees' | 'no-analysis' | 'no-skills' | 'no-positions' | 'loading';
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost';
  };
  className?: string;
}

export const MobileEmptyState: React.FC<MobileEmptyStateProps> = ({
  type,
  title,
  description,
  action,
  className
}) => {
  const getEmptyStateConfig = (type: string) => {
    switch (type) {
      case 'no-employees':
        return {
          icon: <Users className="h-12 w-12 text-gray-400" />,
          title: title || 'No Employees Found',
          description: description || 'Import employees to start analyzing their skills and identify gaps.',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          iconColor: 'text-blue-500'
        };
      
      case 'no-analysis':
        return {
          icon: <BarChart3 className="h-12 w-12 text-gray-400" />,
          title: title || 'No Analysis Available',
          description: description || 'Upload employee CVs and run skills analysis to see gap reports.',
          bgColor: 'bg-purple-50 dark:bg-purple-900/20',
          iconColor: 'text-purple-500'
        };
      
      case 'no-skills':
        return {
          icon: <Target className="h-12 w-12 text-gray-400" />,
          title: title || 'No Skills Data',
          description: description || 'Skills analysis is required to identify skill gaps.',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          iconColor: 'text-green-500'
        };
      
      case 'no-positions':
        return {
          icon: <FileText className="h-12 w-12 text-gray-400" />,
          title: title || 'No Positions Configured',
          description: description || 'Add position requirements to analyze skills gaps.',
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
          iconColor: 'text-orange-500'
        };
      
      case 'loading':
        return {
          icon: <TrendingUp className="h-12 w-12 text-gray-400 animate-pulse" />,
          title: title || 'Loading Analysis...',
          description: description || 'Please wait while we analyze the skills data.',
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          iconColor: 'text-gray-500'
        };
      
      default:
        return {
          icon: <Search className="h-12 w-12 text-gray-400" />,
          title: title || 'No Data Available',
          description: description || 'There is no data to display at this time.',
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          iconColor: 'text-gray-500'
        };
    }
  };

  const config = getEmptyStateConfig(type);

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-8">
        <div className="text-center space-y-4">
          {/* Icon */}
          <div className={cn(
            "mx-auto w-20 h-20 rounded-full flex items-center justify-center",
            config.bgColor
          )}>
            <div className={config.iconColor}>
              {config.icon}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {config.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
            {config.description}
          </p>

          {/* Action Button */}
          {action && (
            <div className="pt-2">
              <Button
                variant={action.variant || 'default'}
                onClick={action.onClick}
                className="w-full sm:w-auto"
              >
                {action.label}
              </Button>
            </div>
          )}

          {/* Additional helpful info based on type */}
          {type === 'no-employees' && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <Upload className="h-4 w-4" />
                <span>Upload a CSV file with employee data</span>
              </div>
            </div>
          )}

          {type === 'no-analysis' && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <FileText className="h-4 w-4" />
                  <span>1. Upload employee CVs</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <BarChart3 className="h-4 w-4" />
                  <span>2. Run skills analysis</span>
                </div>
              </div>
            </div>
          )}

          {type === 'loading' && (
            <div className="pt-4">
              <div className="flex justify-center">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};