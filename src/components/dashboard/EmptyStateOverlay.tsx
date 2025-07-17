import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface EmptyStateOverlayProps {
  icon: LucideIcon;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  secondaryAction?: {
    text: string;
    onClick: () => void;
  };
}

const EmptyStateOverlay: React.FC<EmptyStateOverlayProps> = ({
  icon: Icon,
  title,
  description,
  ctaText,
  ctaLink,
  secondaryAction
}) => {
  const navigate = useNavigate();

  return (
    <div className="absolute inset-4 sm:inset-6 lg:inset-8 flex items-center justify-center z-10">
      {/* Background with gradient matching early access login */}
      <div className="absolute inset-0 bg-gradient-to-br from-smart-beige via-future-green/10 to-smart-beige rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-future-green/5 via-transparent to-business-black/5" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-future-green/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-lxera-blue/10 rounded-full blur-2xl" />
      </div>
      
      {/* Content overlay */}
      <div className="relative bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 p-6 sm:p-8 lg:p-10 text-center max-w-md w-full">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-future-green/20 to-business-black/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-business-black" />
        </div>
        
        <h3 className="text-lg sm:text-xl font-bold text-business-black mb-2">
          {title}
        </h3>
        
        <p className="text-sm sm:text-base text-gray-700 mb-6 leading-relaxed font-medium">
          {description}
        </p>
        
        <div className="space-y-3">
          <Button 
            onClick={() => navigate(ctaLink)}
            className="w-full bg-gradient-to-r from-business-black to-business-black/90 hover:from-business-black hover:to-business-black text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            size="lg"
          >
            {ctaText}
          </Button>
          
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="text-sm text-business-black/80 hover:text-business-black font-bold transition-colors underline underline-offset-2"
            >
              {secondaryAction.text}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmptyStateOverlay;