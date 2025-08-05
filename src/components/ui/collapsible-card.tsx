import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from './card';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface CollapsibleCardProps {
  title: string;
  icon?: React.ReactNode;
  summary?: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}

export function CollapsibleCard({
  title,
  icon,
  summary,
  children,
  defaultExpanded = false,
  className
}: CollapsibleCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <Card className={cn("transition-all duration-200", className)}>
      <CardHeader 
        className="cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
        {!isExpanded && summary && (
          <p className="text-sm text-muted-foreground mt-1">{summary}</p>
        )}
      </CardHeader>
      {isExpanded && (
        <CardContent className="pt-0">
          {children}
        </CardContent>
      )}
    </Card>
  );
}