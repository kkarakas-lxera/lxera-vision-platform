import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  showHandle?: boolean;
  handleClassName?: string;
}

export function SortableItem({ 
  id, 
  children, 
  className,
  showHandle = true,
  handleClassName
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative',
        isDragging && 'opacity-50 z-50',
        className
      )}
    >
      {showHandle && (
        <div
          {...attributes}
          {...listeners}
          className={cn(
            'absolute left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing',
            'opacity-0 group-hover:opacity-100 transition-opacity',
            'text-muted-foreground hover:text-foreground',
            handleClassName
          )}
        >
          <GripVertical className="h-5 w-5" />
        </div>
      )}
      {children}
    </div>
  );
}