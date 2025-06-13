
import { useEffect, useState } from 'react';

interface AnimatedBarsProps {
  className?: string;
  count?: number;
}

const AnimatedBars = ({ className = "", count = 8 }: AnimatedBarsProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className={`relative ${className}`}>
      {[...Array(count)].map((_, i) => {
        const randomWidth = Math.random() * 150 + 80; // 80-230px width
        const randomHeight = Math.random() * 40 + 20; // 20-60px height
        const randomDelay = Math.random() * 2; // 0-2s delay
        const randomDuration = Math.random() * 3 + 2; // 2-5s duration
        
        return (
          <div
            key={i}
            className="absolute bg-future-green rounded-sm opacity-80 hover:opacity-100 transition-opacity duration-300"
            style={{
              width: `${randomWidth}px`,
              height: `${randomHeight}px`,
              left: `${(i % 4) * 25}%`,
              top: `${Math.floor(i / 4) * 80}px`,
              animationDelay: `${randomDelay}s`,
              animationDuration: `${randomDuration}s`,
            }}
          >
            <div 
              className="w-full h-full bg-gradient-to-r from-future-green to-light-green rounded-sm animate-pulse-slow"
              style={{
                animationDelay: `${randomDelay + 0.5}s`,
              }}
            />
          </div>
        );
      })}
      
      {/* Additional floating bars with different styling */}
      {[...Array(4)].map((_, i) => (
        <div
          key={`floating-${i}`}
          className="absolute bg-light-green/60 rounded-sm animate-float-gentle"
          style={{
            width: `${Math.random() * 100 + 60}px`,
            height: `${Math.random() * 30 + 15}px`,
            right: `${i * 15}%`,
            top: `${i * 60 + 20}px`,
            animationDelay: `${i * 0.8}s`,
            animationDuration: `${4 + i * 0.5}s`,
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedBars;
