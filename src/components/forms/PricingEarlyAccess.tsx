import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/sonner';

interface PricingEarlyAccessProps {
  source?: string;
  className?: string;
  openEarlyAccessModal?: (source: string) => void;
}

const PricingEarlyAccess: React.FC<PricingEarlyAccessProps> = ({
  source = 'pricing_page',
  className = '',
  openEarlyAccessModal
}) => {

  const handleClick = () => {
    try {
      if (openEarlyAccessModal) {
        openEarlyAccessModal(source);
      } else {
        console.error('Early access modal handler not provided');
        toast.error('Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Error opening early access modal:', error);
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <Button
      onClick={handleClick}
      className={cn(
        "w-full py-4 rounded-xl font-semibold text-base transition-all duration-300 hover:scale-105 hover:shadow-lg font-inter",
        "bg-white hover:bg-gray-50 text-business-black border-2 border-business-black hover:bg-business-black hover:text-white",
        className
      )}
    >
      Get Early Access
    </Button>
  );
};

export default PricingEarlyAccess;