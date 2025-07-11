import React from 'react';
import { Button } from '@/components/ui/button';

interface PricingContactSalesProps {
  source?: string;
  onSuccess?: (email: string, name: string) => void;
  className?: string;
  openContactSalesModal?: (source: string) => void;
}

const PricingContactSales: React.FC<PricingContactSalesProps> = ({
  source = 'pricing_contact_sales',
  onSuccess,
  className = '',
  openContactSalesModal
}) => {
  const handleClick = () => {
    if (openContactSalesModal) {
      openContactSalesModal(source);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <Button
        onClick={handleClick}
        className="w-full py-4 rounded-xl font-semibold text-base transition-all duration-300 hover:scale-105 hover:shadow-lg font-inter bg-white hover:bg-gray-50 text-business-black border-2 border-business-black hover:bg-business-black hover:text-white"
      >
        Contact Sales
      </Button>
    </div>
  );
};

export default PricingContactSales;