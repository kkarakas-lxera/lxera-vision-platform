import React, { useRef, useEffect, useState, memo } from "react";
import { cn } from "../../../../lib/utils";

interface WavyBackgroundMobileProps {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  colors?: string[];
  waveWidth?: number;
  backgroundFill?: string;
  blur?: number;
  speed?: "slow" | "fast";
  waveOpacity?: number;
}

export const WavyBackgroundMobile: React.FC<WavyBackgroundMobileProps> = memo(({
  children,
  className,
  containerClassName,
  colors = ["#7AE5C6", "#5EDBBA", "#4ECAA8"],
  waveWidth = 50,
  backgroundFill = "white",
  blur = 10,
  speed = "fast",
  waveOpacity = 0.5,
  ...props
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const animationIdRef = useRef<number>();
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctxRef.current = ctx;

    let w: number;
    let h: number;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2); // Limit DPR on mobile for performance
      
      w = rect.width;
      h = rect.height;
      
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();

    let animationId: number;
    let nt = 0;

    // Simplified wave function for mobile
    const getWavePoints = (offset: number) => {
      const points = [];
      const segments = isMobile ? 6 : 10; // Fewer segments on mobile
      
      for (let x = 0; x <= w; x += w / segments) {
        const y = Math.sin((x * 0.01) + offset) * (isMobile ? 15 : 25) + h * 0.5;
        points.push({ x, y });
      }
      return points;
    };

    const drawWave = (offset: number, colorIndex: number) => {
      if (!ctx) return;

      const points = getWavePoints(offset);
      const gradient = ctx.createLinearGradient(0, 0, 0, h);
      
      const color = colors[colorIndex % colors.length];
      gradient.addColorStop(0, `${color}20`); // Lower opacity for mobile
      gradient.addColorStop(1, `${color}40`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(0, h);

      // Simplified curve drawing for better mobile performance
      for (let i = 0; i < points.length - 1; i++) {
        const current = points[i];
        const next = points[i + 1];
        const midX = (current.x + next.x) / 2;
        const midY = (current.y + next.y) / 2;
        
        if (i === 0) {
          ctx.lineTo(current.x, current.y);
        }
        ctx.quadraticCurveTo(current.x, current.y, midX, midY);
      }

      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
    };

    const render = () => {
      if (!ctx || !canvas) return;
      
      ctx.fillStyle = backgroundFill || "white";
      ctx.globalAlpha = 1;
      ctx.fillRect(0, 0, w, h);

      const speedMultiplier = speed === "fast" ? 0.02 : 0.01;
      
      // Fewer wave layers on mobile for performance
      const waveCount = isMobile ? 2 : 3;
      
      for (let i = 0; i < waveCount; i++) {
        ctx.globalAlpha = (waveOpacity || 0.5) * (1 - i * 0.2);
        drawWave(nt * speedMultiplier + i * Math.PI / 3, i);
      }

      nt += 1;
      animationIdRef.current = requestAnimationFrame(render);
    };

    // Start animation with reduced frame rate on mobile if needed
    let lastTime = 0;
    const targetFPS = isMobile ? 30 : 60;
    const frameInterval = 1000 / targetFPS;

    const animateWithFPS = (currentTime: number) => {
      if (currentTime - lastTime >= frameInterval) {
        render();
        lastTime = currentTime;
      }
      requestAnimationFrame(animateWithFPS);
    };

    animateWithFPS(0);

    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [colors, waveWidth, backgroundFill, blur, speed, waveOpacity, isMobile]);

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center",
        containerClassName
      )}
      {...props}
    >
      <canvas
        className="absolute inset-0 z-0"
        ref={canvasRef}
        style={{
          filter: `blur(${blur}px)`,
          opacity: isMobile ? 0.8 : 1, // Slightly lower opacity on mobile
        }}
      />
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
});

WavyBackgroundMobile.displayName = "WavyBackgroundMobile";