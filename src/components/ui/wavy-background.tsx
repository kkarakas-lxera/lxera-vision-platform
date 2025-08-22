"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { createNoise3D } from "simplex-noise";

export const WavyBackground = ({
  children,
  className,
  containerClassName,
  colors,
  waveWidth,
  backgroundFill,
  blur = 10,
  speed = "fast",
  waveOpacity = 0.5,
  ...props
}: {
  children?: any;
  className?: string;
  containerClassName?: string;
  colors?: string[];
  waveWidth?: number;
  backgroundFill?: string;
  blur?: number;
  speed?: "slow" | "fast";
  waveOpacity?: number;
  [key: string]: any;
}) => {
  const noise = createNoise3D();
  const [isInView, setIsInView] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  let w: number,
    h: number,
    nt: number,
    i: number,
    x: number,
    ctx: any,
    canvas: any;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Optimize: Pause animation when scrolling + reduce FPS for performance
  const [targetFPS, setTargetFPS] = useState(60);
  
  useEffect(() => {
    let scrollTimer: NodeJS.Timeout;
    
    const handleScroll = () => {
      setIsScrolling(true);
      setTargetFPS(20); // Reduce FPS during scroll
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        setIsScrolling(false);
        setTargetFPS(60); // Resume normal FPS
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

  const getSpeed = () => {
    switch (speed) {
      case "slow":
        return 0.001;
      case "fast":
        return 0.002;
      default:
        return 0.001;
    }
  };

  // Throttled resize handler for better performance
  const handleResize = useCallback(() => {
    if (!ctx) return;
    w = ctx.canvas.width = window.innerWidth;
    h = ctx.canvas.height = window.innerHeight;
    ctx.filter = `blur(${blur}px)`;
    // Clear wave cache on resize
    wavePointsCache.current = [];
  }, [blur]);
  
  const init = () => {
    canvas = canvasRef.current;
    ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Enable hardware acceleration hints
    ctx.imageSmoothingEnabled = false; // Disable for better performance
    
    w = ctx.canvas.width = window.innerWidth;
    h = ctx.canvas.height = window.innerHeight;
    ctx.filter = `blur(${blur}px)`;
    nt = 0;
    
    // Throttled resize handler
    let resizeTimeout: NodeJS.Timeout;
    const throttledResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 100); // 100ms throttle
    };
    window.addEventListener('resize', throttledResize, { passive: true });
    
    return () => {
      window.removeEventListener('resize', throttledResize);
      clearTimeout(resizeTimeout);
    };
    render();
  };

  const waveColors = colors ?? [
    "#7AE5C6",
    "#5EDBBA", 
    "#4ECAA8",
    "#3EB896",
    "#2EA784",
  ];
  
  // Pre-calculate wave points for better performance
  const wavePointsCache = useRef<number[][]>([]);
  const lastNt = useRef(0);
  
  const drawWave = (n: number) => {
    if (!ctx) return;
    
    if (shouldAnimate) {
      nt += getSpeed();
    }
    
    // Only recalculate if time has changed significantly (frame throttling)
    const ntDelta = Math.abs(nt - lastNt.current);
    if (ntDelta < 0.001 && wavePointsCache.current.length > 0) {
      // Use cached points
      for (i = 0; i < n; i++) {
        ctx.beginPath();
        ctx.lineWidth = waveWidth || 50;
        ctx.strokeStyle = waveColors[i % waveColors.length];
        const cachedPoints = wavePointsCache.current[i];
        if (cachedPoints) {
          for (let j = 0; j < cachedPoints.length; j += 2) {
            ctx.lineTo(cachedPoints[j], cachedPoints[j + 1]);
          }
        }
        ctx.stroke();
        ctx.closePath();
      }
      return;
    }
    
    // Calculate and cache new points
    wavePointsCache.current = [];
    lastNt.current = nt;
    
    for (i = 0; i < n; i++) {
      ctx.beginPath();
      ctx.lineWidth = waveWidth || 50;
      ctx.strokeStyle = waveColors[i % waveColors.length];
      
      const points: number[] = [];
      // Reduce calculation frequency for better performance
      const step = w < 768 ? 8 : 5; // Bigger steps on smaller screens
      for (x = 0; x < w; x += step) {
        const y = noise(x / 800, 0.3 * i, nt) * 100;
        const finalY = y + h * 0.5;
        ctx.lineTo(x, finalY);
        points.push(x, finalY);
      }
      wavePointsCache.current[i] = points;
      ctx.stroke();
      ctx.closePath();
    }
  };

  let animationId: number;
  const shouldAnimate = isInView && !isScrolling;
  const lastFrameTime = useRef(0);
  
  const render = (currentTime?: number) => {
    if (!ctx || !canvas || !shouldAnimate) return;
    
    // FPS throttling based on target FPS
    const fpsInterval = 1000 / targetFPS;
    const now = currentTime || performance.now();
    const elapsed = now - lastFrameTime.current;
    
    if (elapsed > fpsInterval) {
      lastFrameTime.current = now - (elapsed % fpsInterval);
      
      // Use requestIdleCallback for background rendering when possible
      if ('requestIdleCallback' in window && targetFPS < 60) {
        requestIdleCallback(() => {
          ctx.fillStyle = backgroundFill || "white";
          ctx.globalAlpha = waveOpacity || 0.5;
          ctx.fillRect(0, 0, w, h);
          drawWave(5);
        });
      } else {
        ctx.fillStyle = backgroundFill || "white";
        ctx.globalAlpha = waveOpacity || 0.5;
        ctx.fillRect(0, 0, w, h);
        drawWave(5);
      }
    }
    
    animationId = requestAnimationFrame(render);
  };

  useEffect(() => {
    init();
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Separate effect to control animation based on shouldAnimate
  useEffect(() => {
    if (shouldAnimate && ctx && canvas) {
      render();
    } else {
      cancelAnimationFrame(animationId);
    }
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [shouldAnimate]);

  const [isSafari, setIsSafari] = useState(false);
  useEffect(() => {
    // I'm sorry but i have got to support it on safari.
    setIsSafari(
      typeof window !== "undefined" &&
        navigator.userAgent.includes("Safari") &&
        !navigator.userAgent.includes("Chrome")
    );
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-screen",
        containerClassName
      )}
    >
      <canvas
        className="absolute inset-0 z-0"
        ref={canvasRef}
        id="canvas"
        style={{
          ...(isSafari ? { filter: `blur(${blur}px)` } : {}),
          willChange: shouldAnimate ? 'transform' : 'unset'
        }}
      ></canvas>
      <div className={cn("relative z-10 w-full h-full", className)} {...props}>
        {children}
      </div>
    </div>
  );
};