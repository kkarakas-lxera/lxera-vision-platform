import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Undo2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UndoOperation {
  type: 'import' | 'delete' | 'update' | 'restore';
  timestamp: Date;
  affectedCount: number;
  data: any;
}

interface UndoButtonProps {
  operation: UndoOperation | null;
  onUndo: () => Promise<void>;
}

export function UndoButton({ operation, onUndo }: UndoButtonProps) {
  const [isExpired, setIsExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds timeout

  useEffect(() => {
    if (!operation) return;

    const timer = setInterval(() => {
      const elapsed = (Date.now() - operation.timestamp.getTime()) / 1000;
      const remaining = Math.max(0, 60 - elapsed);
      
      setTimeLeft(Math.ceil(remaining));
      
      if (remaining <= 0) {
        setIsExpired(true);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [operation]);

  if (!operation || isExpired) return null;

  const getOperationText = () => {
    switch (operation.type) {
      case 'import':
        return `Import ${operation.affectedCount} employees`;
      case 'delete':
        return `Delete ${operation.affectedCount} employees`;
      case 'update':
        return `Update ${operation.affectedCount} employees`;
      case 'restore':
        return 'Restore batch';
      default:
        return 'Last action';
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onUndo}
      className={cn(
        "flex items-center gap-2 transition-opacity",
        timeLeft <= 10 && "opacity-75"
      )}
    >
      <Undo2 className="h-4 w-4" />
      <span>Undo {getOperationText()}</span>
      <span className="text-xs text-gray-500">({timeLeft}s)</span>
    </Button>
  );
}