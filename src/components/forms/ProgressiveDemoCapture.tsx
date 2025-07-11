import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProgressiveDemoCaptureProps {
  source: string;
  variant?: 'default' | 'mobile' | 'minimal';
  buttonText?: string;
  className?: string;
  openDemoModal?: (source: string) => void;
}

const ProgressiveDemoCapture: React.FC<ProgressiveDemoCaptureProps> = ({
  source,
  variant = 'default',  
  buttonText = 'Book Demo',
  className = '',
  openDemoModal
}) => {

  const handleClick = () => {
    if (openDemoModal) {
      openDemoModal(source);
    }
  };

  // Minimal variant - ultra compact
  if (variant === 'minimal') {
    return (
      <button
        onClick={handleClick}
        className={cn(
          "bg-white text-business-black hover:bg-gray-50 font-medium shadow-lg hover:shadow-xl border-2 border-business-black/20 hover:border-business-black/40",
          "h-11 px-8 rounded-full",
          "transition-all duration-300 transform relative overflow-hidden hover:scale-105",
          className
        )}
      >
        {buttonText}
      </button>
    );
  }

  // Default and mobile variants
  return (
    <Button
      onClick={handleClick}
      className={cn(
        "bg-white text-business-black hover:bg-gray-50 font-medium shadow-lg hover:shadow-xl border-2 border-business-black/20 hover:border-business-black/40",
        variant === 'mobile' ? 'h-12 text-base w-full rounded-full' : 'h-11 px-8 rounded-full',
        "transition-all duration-300 transform relative overflow-hidden hover:scale-105",
        className
      )}
    >
      {buttonText}
    </Button>
  );
};

export default ProgressiveDemoCapture;
