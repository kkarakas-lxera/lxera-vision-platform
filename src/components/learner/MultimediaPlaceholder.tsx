import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle, FileDown, Headphones, Image, Monitor, FileText } from 'lucide-react';

interface MultimediaPlaceholderProps {
  type: 'video' | 'audio' | 'image' | 'interactive' | 'document' | 'download';
  title: string;
  description?: string;
  duration?: string;
  size?: string;
  comingSoon?: boolean;
  onAction?: () => void;
}

export default function MultimediaPlaceholder({
  type,
  title,
  description,
  duration,
  size,
  comingSoon = true,
  onAction
}: MultimediaPlaceholderProps) {
  const getIcon = () => {
    switch (type) {
      case 'video':
        return PlayCircle;
      case 'audio':
        return Headphones;
      case 'image':
        return Image;
      case 'interactive':
        return Monitor;
      case 'document':
        return FileText;
      case 'download':
        return FileDown;
      default:
        return PlayCircle;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'video':
        return 'bg-blue-50 border-blue-200';
      case 'audio':
        return 'bg-purple-50 border-purple-200';
      case 'image':
        return 'bg-green-50 border-green-200';
      case 'interactive':
        return 'bg-orange-50 border-orange-200';
      case 'document':
        return 'bg-gray-50 border-gray-200';
      case 'download':
        return 'bg-indigo-50 border-indigo-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'video':
        return 'text-blue-600';
      case 'audio':
        return 'text-purple-600';
      case 'image':
        return 'text-green-600';
      case 'interactive':
        return 'text-orange-600';
      case 'document':
        return 'text-gray-600';
      case 'download':
        return 'text-indigo-600';
      default:
        return 'text-gray-600';
    }
  };

  const Icon = getIcon();
  const bgColor = getBackgroundColor();
  const iconColor = getIconColor();

  return (
    <Card className={`p-6 ${bgColor} transition-all hover:shadow-md`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg bg-white shadow-sm`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        
        <div className="flex-1 space-y-2">
          <h3 className="font-semibold text-lg">{title}</h3>
          
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {duration && (
              <span className="flex items-center gap-1">
                <PlayCircle className="h-3 w-3" />
                {duration}
              </span>
            )}
            {size && (
              <span className="flex items-center gap-1">
                <FileDown className="h-3 w-3" />
                {size}
              </span>
            )}
          </div>
          
          {comingSoon ? (
            <div className="mt-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/80 rounded-full text-xs font-medium">
                <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
                Coming Soon
              </div>
            </div>
          ) : (
            <Button 
              onClick={onAction}
              variant="secondary"
              size="sm"
              className="mt-4"
            >
              <Icon className="h-4 w-4 mr-2" />
              {type === 'video' || type === 'audio' ? 'Play' : 
               type === 'download' || type === 'document' ? 'Download' : 
               type === 'interactive' ? 'Start' : 'View'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

// Example usage component for different multimedia types
export function MultimediaSection({ sectionType }: { sectionType: string }) {
  const getMultimediaForSection = () => {
    switch (sectionType) {
      case 'introduction':
        return (
          <MultimediaPlaceholder
            type="video"
            title="Welcome to the Module"
            description="Get an overview of what you'll learn in this module"
            duration="5:30"
          />
        );
      
      case 'core_content':
        return (
          <>
            <MultimediaPlaceholder
              type="video"
              title="Understanding Key Concepts"
              description="Deep dive into the core principles with visual demonstrations"
              duration="12:45"
            />
            <MultimediaPlaceholder
              type="interactive"
              title="Interactive Concept Explorer"
              description="Explore the concepts interactively with our simulation tool"
            />
          </>
        );
      
      case 'practical_applications':
        return (
          <>
            <MultimediaPlaceholder
              type="download"
              title="Practice Files & Templates"
              description="Download the exercise files to follow along"
              size="2.4 MB"
            />
            <MultimediaPlaceholder
              type="video"
              title="Step-by-Step Tutorial"
              description="Follow along as we work through a real example"
              duration="18:20"
            />
          </>
        );
      
      case 'case_studies':
        return (
          <>
            <MultimediaPlaceholder
              type="document"
              title="Case Study: Complete Analysis"
              description="Detailed analysis document with financial data"
              size="1.2 MB"
            />
            <MultimediaPlaceholder
              type="audio"
              title="Expert Interview: Industry Insights"
              description="Listen to industry experts discuss this case"
              duration="15:30"
            />
          </>
        );
      
      case 'assessments':
        return (
          <MultimediaPlaceholder
            type="interactive"
            title="Interactive Assessment"
            description="Test your knowledge with our interactive quiz platform"
            comingSoon={false}
            onAction={() => console.log('Start assessment')}
          />
        );
      
      default:
        return null;
    }
  };

  const multimedia = getMultimediaForSection();
  
  if (!multimedia) return null;
  
  return (
    <div className="space-y-4 my-6">
      {multimedia}
    </div>
  );
}