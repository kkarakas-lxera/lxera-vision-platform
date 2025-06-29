import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CourseContentSectionProps {
  title: string;
  content: string;
  icon: React.ReactNode;
  defaultExpanded?: boolean;
  wordCount?: number;
}

export const CourseContentSection: React.FC<CourseContentSectionProps> = ({
  title,
  content,
  icon,
  defaultExpanded = false,
  wordCount
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  // Get a preview of the content (first 150 characters)
  const previewContent = content.length > 150 
    ? content.substring(0, 150) + '...' 
    : content;
    
  // Calculate estimated reading time (150 words per minute)
  const estimatedWords = wordCount || content.split(/\s+/).length;
  const readingTimeMinutes = Math.ceil(estimatedWords / 150);
  const readingTimeText = readingTimeMinutes === 1 ? '1 min read' : `${readingTimeMinutes} min read`;

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            {title}
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {readingTimeText}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn(
          "prose prose-sm max-w-none dark:prose-invert",
          "prose-headings:text-foreground prose-p:text-muted-foreground",
          "prose-strong:text-foreground prose-ul:text-muted-foreground",
          "prose-ol:text-muted-foreground prose-li:text-muted-foreground",
          "prose-blockquote:text-muted-foreground prose-blockquote:border-l-primary",
          "prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded",
          "prose-pre:bg-muted prose-pre:text-foreground",
          "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
          "prose-p:text-sm prose-li:text-sm prose-td:text-sm",
          "prose-h1:text-lg prose-h2:text-base prose-h3:text-sm",
          "prose-h2:font-semibold prose-h2:mt-4 prose-h2:mb-2",
          "prose-p:leading-relaxed prose-li:leading-relaxed",
          !isExpanded && "line-clamp-3"
        )}>
          {isExpanded ? (
            <ReactMarkdown>{content}</ReactMarkdown>
          ) : (
            <ReactMarkdown>{previewContent}</ReactMarkdown>
          )}
        </div>
        {content.length > 150 && (
          <Button
            variant="link"
            size="sm"
            className="mt-2 p-0 h-auto"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};