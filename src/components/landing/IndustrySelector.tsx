import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Heart, 
  Banknote, 
  Factory, 
  GraduationCap, 
  ShoppingCart 
} from 'lucide-react';

interface IndustrySelectorProps {
  selectedIndustry: string;
  onIndustrySelect: (industry: string) => void;
}

const IndustrySelector: React.FC<IndustrySelectorProps> = ({ 
  selectedIndustry, 
  onIndustrySelect 
}) => {
  const industries = [
    { name: 'Technology', icon: Building2, color: 'text-future-green' },
    { name: 'Healthcare', icon: Heart, color: 'text-future-green' },
    { name: 'Finance', icon: Banknote, color: 'text-future-green' },
    { name: 'Manufacturing', icon: Factory, color: 'text-future-green' },
    { name: 'Education', icon: GraduationCap, color: 'text-future-green' },
    { name: 'Retail', icon: ShoppingCart, color: 'text-future-green' }
  ];

  return (
    <section className="py-12 bg-gradient-to-br from-white via-future-green/5 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-business-black mb-4">
            Select Your Industry
          </h2>
          <p className="text-lg text-business-black/70">
            See customized skills gap analysis for your sector
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {industries.map((industry) => {
            const IconComponent = industry.icon;
            const isSelected = selectedIndustry === industry.name;
            
            return (
              <Button
                key={industry.name}
                onClick={() => onIndustrySelect(industry.name)}
                variant="outline"
                className={`h-auto p-6 flex flex-col items-center gap-3 transition-all duration-300 ${
                  isSelected 
                    ? 'bg-future-green/20 border-future-green border-2 text-business-black' 
                    : 'bg-white hover:bg-future-green/10 border-business-black/30 text-business-black hover:border-future-green'
                }`}
              >
                <IconComponent className={`h-8 w-8 ${industry.color}`} />
                <span className="font-medium text-sm">{industry.name}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default IndustrySelector;