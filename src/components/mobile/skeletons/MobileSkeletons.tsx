'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function MobileListSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-card rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              <div className="h-3 w-24 bg-muted rounded animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full bg-muted rounded animate-pulse" />
            <div className="h-3 w-4/5 bg-muted rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MobileCardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('bg-card rounded-lg p-4', className)}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-5 w-24 bg-muted rounded animate-pulse" />
          <div className="h-5 w-16 bg-muted rounded animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full bg-muted rounded animate-pulse" />
          <div className="h-3 w-3/4 bg-muted rounded animate-pulse" />
        </div>
        <div className="flex gap-2 pt-2">
          <div className="h-8 w-20 bg-muted rounded animate-pulse" />
          <div className="h-8 w-20 bg-muted rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function MobileFormSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-3 w-20 bg-muted rounded animate-pulse" />
          <div className="h-10 w-full bg-muted rounded animate-pulse" />
        </div>
      ))}
      <div className="flex gap-3 pt-4">
        <div className="h-10 flex-1 bg-muted rounded animate-pulse" />
        <div className="h-10 flex-1 bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
}

export function MobileTableSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b">
        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
        <div className="h-4 w-24 bg-muted rounded animate-pulse ml-auto" />
      </div>
      
      {/* Rows */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3 border-b">
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            <div className="h-3 w-24 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-4 w-16 bg-muted rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export function MobileStatsSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-3', className)}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-card rounded-lg p-4 space-y-2">
          <div className="h-3 w-16 bg-muted rounded animate-pulse" />
          <div className="h-6 w-24 bg-muted rounded animate-pulse" />
          <div className="h-2 w-12 bg-muted rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export function MobileHeaderSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('h-14 flex items-center gap-3 px-4 border-b bg-background/95 backdrop-blur-md', className)}>
      <div className="h-9 w-9 bg-muted rounded animate-pulse" />
      <div className="h-5 w-32 bg-muted rounded animate-pulse" />
      <div className="h-9 w-9 bg-muted rounded animate-pulse ml-auto" />
    </div>
  );
}