import { cn } from "../../../../lib/utils";
import { useEffect, useRef, useState } from "react";

interface BeamsBackgroundMobileProps {
  className?: string;
  intensity?: "light" | "medium" | "strong";
}

export default function BeamsBackgroundMobile({
  className,
  intensity = "medium",
}: BeamsBackgroundMobileProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5); // Limit DPR for mobile performance
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();

    // Mobile-optimized beam configuration
    const beamCount = 3; // Fewer beams on mobile
    const beams: Array<{
      x: number;
      y: number;
      angle: number;
      length: number;
      opacity: number;
      speed: number;
    }> = [];

    // Initialize beams
    for (let i = 0; i < beamCount; i++) {
      beams.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        angle: Math.random() * Math.PI * 2,
        length: 100 + Math.random() * 200,
        opacity: 0.1 + Math.random() * 0.3,
        speed: 0.3 + Math.random() * 0.5, // Slower on mobile
      });
    }

    const intensityMultiplier = {
      light: 0.3,
      medium: 0.5,
      strong: 0.8,
    }[intensity];

    let time = 0;

    const render = () => {
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.95)');
      gradient.addColorStop(1, 'rgba(17, 24, 39, 0.95)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw simplified beams for mobile
      beams.forEach((beam, index) => {
        const phase = time * beam.speed + index * Math.PI / 3;
        
        // Update beam position
        beam.x += Math.cos(beam.angle) * 0.2;
        beam.y += Math.sin(beam.angle) * 0.2;
        
        // Wrap around screen
        if (beam.x < -beam.length) beam.x = canvas.width + beam.length;
        if (beam.x > canvas.width + beam.length) beam.x = -beam.length;
        if (beam.y < -beam.length) beam.y = canvas.height + beam.length;
        if (beam.y > canvas.height + beam.length) beam.y = -beam.length;

        // Calculate beam end position
        const endX = beam.x + Math.cos(beam.angle) * beam.length;
        const endY = beam.y + Math.sin(beam.angle) * beam.length;

        // Create beam gradient
        const beamGradient = ctx.createLinearGradient(beam.x, beam.y, endX, endY);
        const baseOpacity = beam.opacity * intensityMultiplier * (0.5 + 0.5 * Math.sin(phase));
        
        beamGradient.addColorStop(0, `rgba(122, 229, 198, ${baseOpacity})`);
        beamGradient.addColorStop(0.5, `rgba(122, 229, 198, ${baseOpacity * 0.6})`);
        beamGradient.addColorStop(1, `rgba(122, 229, 198, 0)`);

        // Draw beam
        ctx.strokeStyle = beamGradient;
        ctx.lineWidth = 1 + Math.sin(phase) * 0.5;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(beam.x, beam.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Add glow effect
        ctx.shadowColor = 'rgba(122, 229, 198, 0.5)';
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      time += 0.016; // ~60fps equivalent
      animationId = requestAnimationFrame(render);
    };

    // Start with reduced frame rate on mobile
    const startAnimation = () => {
      let lastTime = 0;
      const targetFPS = 30; // Lower FPS for mobile
      const frameInterval = 1000 / targetFPS;

      const animate = (currentTime: number) => {
        if (currentTime - lastTime >= frameInterval) {
          render();
          lastTime = currentTime;
        }
        animationId = requestAnimationFrame(animate);
      };

      animate(0);
    };

    startAnimation();

    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [intensity, isMounted]);

  if (!isMounted) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "absolute inset-0 z-0",
        className
      )}
      style={{ mixBlendMode: "lighten" }}
    />
  );
}