import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface InlineEmailCaptureProps {
  source: string;
  variant?: 'default' | 'mobile';
  buttonText?: string;
  className?: string;
  openEarlyAccessModal?: (source: string) => void;
}

const InlineEmailCapture: React.FC<InlineEmailCaptureProps> = ({
  source,
  variant = 'default',
  buttonText = 'Get Started',
  className = '',
  openEarlyAccessModal
}) => {

  const handleClick = () => {
    if (openEarlyAccessModal) {
      openEarlyAccessModal(source);
    }
  };

  const isMobile = variant === 'mobile';

  return (
    <Button 
      onClick={handleClick}
      className={cn(
        "bg-future-green text-business-black hover:bg-future-green/90 font-medium",
        isMobile ? 'h-12 text-base w-full' : 'h-11 px-6',
        "min-h-[48px] touch-manipulation transition-all duration-300 transform hover:scale-105 hover:shadow-lg",
        className
      )}
    >
      {buttonText}
    </Button>
  );
};

export default InlineEmailCapture;