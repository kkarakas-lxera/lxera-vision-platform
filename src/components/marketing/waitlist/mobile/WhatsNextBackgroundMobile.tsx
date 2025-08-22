import React, { useRef, useEffect, useState } from 'react';

const WhatsNextBackgroundMobile: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const animationIdRef = useRef<number>();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (canvasRef.current) {
      observer.observe(canvasRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5); // Limit DPR for mobile
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();

    // Mobile-optimized particles
    const particles: Array<{
      x: number;
      y: number;
      radius: number;
      dx: number;
      dy: number;
      opacity: number;
    }> = [];

    // Fewer particles for mobile performance
    const particleCount = 15;
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: 1 + Math.random() * 2,
        dx: (Math.random() - 0.5) * 0.3, // Slower movement
        dy: (Math.random() - 0.5) * 0.3,
        opacity: 0.1 + Math.random() * 0.4,
      });
    }

    let time = 0;

    const render = () => {
      if (!ctx || !canvas) return;

      // Clear with gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgb(17, 24, 39)'); // gray-900
      gradient.addColorStop(1, 'rgb(0, 0, 0)'); // black
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw simplified particles
      particles.forEach((particle, index) => {
        // Update position
        particle.x += particle.dx;
        particle.y += particle.dy;

        // Wrap around screen
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Pulsing opacity effect
        const pulse = 0.5 + 0.5 * Math.sin(time * 0.01 + index * 0.5);
        const currentOpacity = particle.opacity * pulse * 0.6;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(122, 229, 198, ${currentOpacity})`;
        ctx.fill();

        // Simple glow effect
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(122, 229, 198, ${currentOpacity * 0.3})`;
        ctx.fill();
      });

      // Simple gradient overlay
      const overlayGradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
      );
      overlayGradient.addColorStop(0, 'rgba(122, 229, 198, 0.03)');
      overlayGradient.addColorStop(1, 'rgba(122, 229, 198, 0)');
      
      ctx.fillStyle = overlayGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      time += 1;
      animationIdRef.current = requestAnimationFrame(render);
    };

    // Start animation with throttling for mobile
    let lastTime = 0;
    const targetFPS = 30;
    const frameInterval = 1000 / targetFPS;

    const throttledRender = (currentTime: number) => {
      if (currentTime - lastTime >= frameInterval) {
        render();
        lastTime = currentTime;
      }
      animationId = requestAnimationFrame(throttledRender);
    };

    throttledRender(0);

    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [isVisible]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ mixBlendMode: 'lighten', opacity: 0.8 }}
    />
  );
};

export default WhatsNextBackgroundMobile;