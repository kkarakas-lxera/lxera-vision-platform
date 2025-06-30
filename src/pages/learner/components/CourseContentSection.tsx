import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, CheckCircle, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface Section {
  section_id: string;
  section_name: string;
  section_content: string;
  word_count: number;
  is_completed?: boolean;
}

interface CourseContentSectionProps {
  section: Section;
  onComplete: () => void;
  isLastSection: boolean;
}

export default function CourseContentSection({ 
  section, 
  onComplete, 
  isLastSection 
}: CourseContentSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Calculate reading time (150 words per minute)
  const readingTime = Math.ceil(section.word_count / 150);

  const formatSectionName = (name: string) => {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const markdownComponents = {
    h1: ({ children, ...props }: any) => (
      <h1 className="text-2xl font-bold mt-6 mb-4 text-foreground" {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }: any) => (
      <h2 className="text-xl font-semibold mt-4 mb-3 text-foreground" {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }: any) => (
      <h3 className="text-lg font-semibold mt-3 mb-2 text-foreground" {...props}>
        {children}
      </h3>
    ),
    p: ({ children, ...props }: any) => (
      <p className="text-base leading-relaxed mb-4 text-muted-foreground" {...props}>
        {children}
      </p>
    ),
    ul: ({ children, ...props }: any) => (
      <ul className="list-disc list-inside mb-4 space-y-2 text-muted-foreground" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }: any) => (
      <ol className="list-decimal list-inside mb-4 space-y-2 text-muted-foreground" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }: any) => (
      <li className="text-base" {...props}>
        {children}
      </li>
    ),
    blockquote: ({ children, ...props }: any) => (
      <blockquote className="border-l-4 border-primary pl-4 italic my-4" {...props}>
        {children}
      </blockquote>
    ),
    code: ({ inline, children, ...props }: any) => (
      inline ? (
        <code className="bg-muted px-1 py-0.5 rounded text-sm" {...props}>
          {children}
        </code>
      ) : (
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4">
          <code className="text-sm" {...props}>
            {children}
          </code>
        </pre>
      )
    ),
  };

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {section.is_completed && (
              <CheckCircle className="h-5 w-5 text-green-600" />
            )}
            <CardTitle className="text-lg">
              {formatSectionName(section.section_name)}
            </CardTitle>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{readingTime} min read</span>
            </div>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-6">
          <div className="prose prose-gray max-w-none">
            <ReactMarkdown components={markdownComponents}>
              {section.section_content}
            </ReactMarkdown>
          </div>
          
          {!section.is_completed && (
            <div className="flex justify-end pt-4 border-t">
              <Button 
                onClick={onComplete}
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Mark as Complete
                {!isLastSection && " & Continue"}
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}