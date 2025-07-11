import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SmartEmailCaptureProps {
  source: string;
  variant?: 'default' | 'mobile' | 'minimal';
  buttonText?: string;
  className?: string;
  openEarlyAccessModal?: (source: string) => void;
  // The following props exist on other call sites but are ignored by this
  // simplified modal-trigger implementation. Adding them keeps TypeScript
  // happy without changing behaviour.
  placeholder?: string;
  initialEmail?: string;
  autoSubmit?: boolean;
  requireCompanyEmail?: boolean;
  onSuccess?: (email: string) => void;
}

const SmartEmailCapture: React.FC<SmartEmailCaptureProps> = ({
  source,
  variant = 'default',
  buttonText = 'Get Early Access',
  className = '',
  openEarlyAccessModal
}) => {

  const handleClick = () => {
    if (openEarlyAccessModal) {
      openEarlyAccessModal(source);
    }
  };

  // Minimal variant - simple underlined text button
  if (variant === 'minimal') {
    return (
      <button
        onClick={handleClick}
        className={cn(
          "text-future-green hover:text-future-green/80 underline underline-offset-4 font-medium transition-colors",
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
        "bg-future-green text-business-black hover:bg-future-green/90 font-medium",
        variant === 'mobile' ? 'h-12 text-base w-full' : 'h-11 px-8',
        "transition-all duration-300 transform hover:scale-105 hover:shadow-lg",
        className
      )}
    >
      {buttonText}
    </Button>
  );
};

export default SmartEmailCapture;