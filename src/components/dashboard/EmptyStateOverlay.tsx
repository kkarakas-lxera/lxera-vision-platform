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
      <div className="bg-white/97 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 lg:p-10 text-center max-w-md w-full">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-gray-600" />
        </div>
        
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        
        <p className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed">
          {description}
        </p>
        
        <div className="space-y-3">
          <Button 
            onClick={() => navigate(ctaLink)}
            className="w-full bg-business-black hover:bg-business-black/90 text-white"
            size="lg"
          >
            {ctaText}
          </Button>
          
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
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