
import { useEffect, useState } from "react";

interface TimelineProps {
  stepCount: number;
  layout: 'desktop' | 'mobile';
}

export const Timeline = ({ stepCount, layout }: TimelineProps) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(100);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (layout === 'mobile') {
    return (
      <div className="absolute left-10 top-0 bottom-0 w-1 z-0 rounded-full overflow-hidden">
        <div className="w-full h-full bg-gradient-to-b from-future-green/20 via-future-green/60 to-future-green/20 rounded-full">
          <div 
            className="w-full bg-gradient-to-b from-future-green/40 via-future-green/80 to-future-green/40 rounded-full transition-all duration-2000 ease-out"
            style={{ height: `${animatedProgress}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 z-0 rounded-full overflow-hidden">
      <div className="h-full bg-gradient-to-r from-future-green/20 via-future-green/60 to-future-green/20 rounded-full">
        <div 
          className="h-full bg-gradient-to-r from-future-green/40 via-future-green/80 to-future-green/40 rounded-full transition-all duration-2000 ease-out"
          style={{ width: `${animatedProgress}%` }}
        />
      </div>
    </div>
  );
};
