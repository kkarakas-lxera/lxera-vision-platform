import React, { useState, ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Components } from 'react-markdown';

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

  // Custom components for ReactMarkdown to control sizes precisely
  const markdownComponents: Components = {
    h1: ({ children, ...props }) => (
      <h1 className="text-base font-semibold mt-4 mb-2 text-foreground" {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2 className="text-sm font-semibold mt-3 mb-1.5 text-foreground" {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3 className="text-sm font-medium mt-2 mb-1 text-foreground" {...props}>
        {children}
      </h3>
    ),
    h4: ({ children, ...props }) => (
      <h4 className="text-sm font-medium mt-2 mb-1 text-foreground" {...props}>
        {children}
      </h4>
    ),
    p: ({ children, ...props }) => (
      <p className="text-sm leading-relaxed mb-3 text-muted-foreground" {...props}>
        {children}
      </p>
    ),
    ul: ({ children, ...props }) => (
      <ul className="list-disc list-inside space-y-1 mb-3 text-sm text-muted-foreground pl-4" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol className="list-decimal list-inside space-y-1 mb-3 text-sm text-muted-foreground pl-4" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li className="text-sm leading-relaxed text-muted-foreground" {...props}>
        {children}
      </li>
    ),
    strong: ({ children, ...props }) => (
      <strong className="font-semibold text-foreground" {...props}>
        {children}
      </strong>
    ),
    em: ({ children, ...props }) => (
      <em className="italic" {...props}>
        {children}
      </em>
    ),
    blockquote: ({ children, ...props }) => (
      <blockquote className="border-l-4 border-primary pl-4 italic text-sm text-muted-foreground my-3" {...props}>
        {children}
      </blockquote>
    ),
    code: ({ children, ...props }) => (
      <code className="bg-muted text-foreground px-1 py-0.5 rounded text-xs font-mono" {...props}>
        {children}
      </code>
    ),
    pre: ({ children, ...props }) => (
      <pre className="bg-muted text-foreground p-3 rounded-md overflow-x-auto text-xs my-3" {...props}>
        {children}
      </pre>
    ),
    a: ({ children, href, ...props }) => (
      <a className="text-primary underline hover:no-underline" href={href} {...props}>
        {children}
      </a>
    ),
  };

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
          "max-w-none",
          !isExpanded && "line-clamp-3"
        )}>
          {isExpanded ? (
            <ReactMarkdown components={markdownComponents}>
              {content}
            </ReactMarkdown>
          ) : (
            <ReactMarkdown 
              components={{
                p: ({ children }) => (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {children}
                  </p>
                ),
              }}
            >
              {previewContent}
            </ReactMarkdown>
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