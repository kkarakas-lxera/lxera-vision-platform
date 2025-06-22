
import { useState } from 'react';
import { ChevronRight, Brain, Zap } from 'lucide-react';

interface ProgressiveCardProps {
  title: string;
  preview: string;
  details: string[];
  insight: string;
  delay?: number;
}

const ProgressiveCard = ({ title, preview, details, insight, delay = 0 }: ProgressiveCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showInsight, setShowInsight] = useState(false);

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setTimeout(() => setShowInsight(true), 300);
    } else {
      setShowInsight(false);
    }
  };

  return (
    <div 
      className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-md border border-future-green/20 hover:shadow-lg transition-all duration-300 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <button
        onClick={handleExpand}
        className="w-full text-left group focus:outline-none focus:ring-2 focus:ring-future-green/30 rounded-lg"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-business-black group-hover:text-future-green transition-colors">
            {title}
          </h3>
          <ChevronRight 
            className={`w-5 h-5 text-business-black/60 transition-all duration-300 ${
              isExpanded ? 'rotate-90 text-future-green' : 'group-hover:text-future-green'
            }`}
          />
        </div>
        <p className="text-business-black/70 text-sm">
          {preview}
        </p>
      </button>

      {/* Progressive Disclosure Content */}
      <div className={`overflow-hidden transition-all duration-500 ease-out ${
        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="pt-4 border-t border-future-green/10 mt-4">
          <ul className="space-y-2 mb-4">
            {details.map((detail, index) => (
              <li 
                key={index}
                className={`flex items-start gap-2 text-sm text-business-black/80 transition-all duration-300 ${
                  isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="w-1.5 h-1.5 bg-future-green rounded-full mt-2 flex-shrink-0"></div>
                {detail}
              </li>
            ))}
          </ul>

          {/* AI Insight appears last */}
          {showInsight && (
            <div className="flex items-start gap-3 bg-future-green/5 p-3 rounded-lg animate-fade-in-up">
              <div className="w-8 h-8 bg-future-green/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Brain className="w-4 h-4 text-business-black" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-3 h-3 text-future-green" />
                  <span className="text-xs font-medium text-business-black/80">AI Insight</span>
                </div>
                <p className="text-sm text-business-black/70 italic">
                  {insight}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressiveCard;
