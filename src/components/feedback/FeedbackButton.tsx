import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import FeedbackModal, { FeedbackType } from './FeedbackModal';

interface FeedbackButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  defaultType?: FeedbackType;
  children?: React.ReactNode;
  className?: string;
  showIcon?: boolean;
  title?: string;
}

export default function FeedbackButton({ 
  variant = 'outline', 
  size = 'sm', 
  defaultType = 'general_feedback',
  children,
  className = '',
  showIcon = true,
  title
}: FeedbackButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsModalOpen(true)}
        className={className}
        title={title}
      >
        {showIcon && !children && <MessageSquare className="h-4 w-4 mr-2" />}
        {children || 'Feedback'}
      </Button>
      
      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultType={defaultType}
      />
    </>
  );
}