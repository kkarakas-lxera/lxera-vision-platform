import React, { useState, useEffect, useRef } from 'react';
import { MeshGradient } from '@paper-design/shaders-react';

// Minimal shader background for What's Next using LXERA colors only
export default function WhatsNextBackground() {
  const [isInView, setIsInView] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Optimize: Pause animation when scrolling
  useEffect(() => {
    let scrollTimer: NodeJS.Timeout;
    
    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimer);
    };
  }, []);
  
  // Optimize: Use Intersection Observer to pause when out of view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  const shouldAnimate = isInView && !isScrolling;

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
      style={{ willChange: shouldAnimate ? 'transform' : 'unset' }}
    >
      <MeshGradient
        className="absolute inset-0 w-full h-full"
        colors={["#000000", "#7AE5C6", "#164e63", "#0b1522"]}
        speed={shouldAnimate ? 0.25 : 0}
        backgroundColor="#000000"
      />
      <MeshGradient
        className="absolute inset-0 w-full h-full opacity-35"
        colors={["#000000", "#7AE5C6", "#0b1522"]}
        speed={shouldAnimate ? 0.15 : 0}
        wireframe="true"
        backgroundColor="transparent"
      />
    </div>
  );
}


