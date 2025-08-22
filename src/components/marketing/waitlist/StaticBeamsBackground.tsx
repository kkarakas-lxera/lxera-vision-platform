import React from 'react';
import { cn } from '@/lib/utils';

interface StaticBeamsBackgroundProps {
  className?: string;
  animated?: boolean;
}

export function StaticBeamsBackground({ className, animated = true }: StaticBeamsBackgroundProps) {
  return (
    <div className={cn('absolute inset-0 overflow-hidden bg-neutral-950', className)}>
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradient definitions for beams */}
          <linearGradient id="beam1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(200, 85%, 65%)" stopOpacity="0" />
            <stop offset="10%" stopColor="hsl(200, 85%, 65%)" stopOpacity="0.15" />
            <stop offset="50%" stopColor="hsl(200, 85%, 65%)" stopOpacity="0.3" />
            <stop offset="90%" stopColor="hsl(200, 85%, 65%)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="hsl(200, 85%, 65%)" stopOpacity="0" />
          </linearGradient>
          
          <linearGradient id="beam2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(220, 85%, 65%)" stopOpacity="0" />
            <stop offset="10%" stopColor="hsl(220, 85%, 65%)" stopOpacity="0.12" />
            <stop offset="50%" stopColor="hsl(220, 85%, 65%)" stopOpacity="0.25" />
            <stop offset="90%" stopColor="hsl(220, 85%, 65%)" stopOpacity="0.12" />
            <stop offset="100%" stopColor="hsl(220, 85%, 65%)" stopOpacity="0" />
          </linearGradient>
          
          <linearGradient id="beam3" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(180, 85%, 65%)" stopOpacity="0" />
            <stop offset="10%" stopColor="hsl(180, 85%, 65%)" stopOpacity="0.18" />
            <stop offset="50%" stopColor="hsl(180, 85%, 65%)" stopOpacity="0.35" />
            <stop offset="90%" stopColor="hsl(180, 85%, 65%)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="hsl(180, 85%, 65%)" stopOpacity="0" />
          </linearGradient>
          
          <linearGradient id="beam4" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(240, 85%, 65%)" stopOpacity="0" />
            <stop offset="10%" stopColor="hsl(240, 85%, 65%)" stopOpacity="0.1" />
            <stop offset="50%" stopColor="hsl(240, 85%, 65%)" stopOpacity="0.2" />
            <stop offset="90%" stopColor="hsl(240, 85%, 65%)" stopOpacity="0.1" />
            <stop offset="100%" stopColor="hsl(240, 85%, 65%)" stopOpacity="0" />
          </linearGradient>
          
          <linearGradient id="beam5" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(160, 85%, 65%)" stopOpacity="0" />
            <stop offset="10%" stopColor="hsl(160, 85%, 65%)" stopOpacity="0.16" />
            <stop offset="50%" stopColor="hsl(160, 85%, 65%)" stopOpacity="0.32" />
            <stop offset="90%" stopColor="hsl(160, 85%, 65%)" stopOpacity="0.16" />
            <stop offset="100%" stopColor="hsl(160, 85%, 65%)" stopOpacity="0" />
          </linearGradient>

          {/* Blur filter */}
          <filter id="blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="15"/>
          </filter>

          {/* Animation definitions */}
          <animateTransform
            id="beam-drift"
            attributeName="transform"
            type="translate"
            values="0,0; -10,5; 0,0; 10,-5; 0,0"
            dur="20s"
            repeatCount="indefinite"
          />
          
          <animate
            id="beam-opacity"
            attributeName="opacity"
            values="0.8; 1; 0.9; 1; 0.8"
            dur="8s"
            repeatCount="indefinite"
          />
        </defs>
        
        {/* Background base */}
        <rect width="100%" height="100%" fill="#0a0a0a" />
        
        {/* Beam elements - positioned diagonally like original */}
        <g filter="url(#blur)" className={animated ? '' : ''}>
          {/* First column of beams */}
          <rect
            x="100"
            y="-200"
            width="80"
            height="1200"
            fill="url(#beam1)"
            transform="rotate(-35 140 400)"
          >
            {animated && (
              <>
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0,0; -5,3; 0,0; 5,-3; 0,0"
                  dur="15s"
                  repeatCount="indefinite"
                  additive="sum"
                />
                <animate
                  attributeName="opacity"
                  values="0.9; 1; 0.8; 1; 0.9"
                  dur="6s"
                  repeatCount="indefinite"
                />
              </>
            )}
          </rect>
          <rect
            x="280"
            y="-150"
            width="60"
            height="1100"
            fill="url(#beam2)"
            transform="rotate(-33 310 450)"
          >
            {animated && (
              <>
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0,0; 7,-2; 0,0; -7,2; 0,0"
                  dur="18s"
                  repeatCount="indefinite"
                  additive="sum"
                />
                <animate
                  attributeName="opacity"
                  values="0.8; 0.9; 1; 0.9; 0.8"
                  dur="7s"
                  repeatCount="indefinite"
                />
              </>
            )}
          </rect>
          <rect
            x="180"
            y="-250"
            width="100"
            height="1300"
            fill="url(#beam3)"
            transform="rotate(-37 230 350)"
          >
            {animated && (
              <>
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0,0; -8,4; 0,0; 8,-4; 0,0"
                  dur="22s"
                  repeatCount="indefinite"
                  additive="sum"
                />
                <animate
                  attributeName="opacity"
                  values="0.9; 0.8; 1; 0.8; 0.9"
                  dur="9s"
                  repeatCount="indefinite"
                />
              </>
            )}
          </rect>
          
          {/* Second column of beams */}
          <rect
            x="450"
            y="-180"
            width="70"
            height="1150"
            fill="url(#beam4)"
            transform="rotate(-34 485 425)"
          >
            {animated && (
              <>
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0,0; 6,-3; 0,0; -6,3; 0,0"
                  dur="16s"
                  repeatCount="indefinite"
                  additive="sum"
                />
                <animate
                  attributeName="opacity"
                  values="0.8; 1; 0.9; 1; 0.8"
                  dur="8s"
                  repeatCount="indefinite"
                />
              </>
            )}
          </rect>
          <rect
            x="380"
            y="-220"
            width="90"
            height="1250"
            fill="url(#beam1)"
            transform="rotate(-36 425 375)"
          >
            {animated && (
              <>
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0,0; -4,6; 0,0; 4,-6; 0,0"
                  dur="19s"
                  repeatCount="indefinite"
                  additive="sum"
                />
                <animate
                  attributeName="opacity"
                  values="0.9; 0.8; 0.9; 1; 0.9"
                  dur="5s"
                  repeatCount="indefinite"
                />
              </>
            )}
          </rect>
          <rect
            x="520"
            y="-160"
            width="65"
            height="1080"
            fill="url(#beam5)"
            transform="rotate(-32 552 460)"
          >
            {animated && (
              <>
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0,0; 9,1; 0,0; -9,-1; 0,0"
                  dur="21s"
                  repeatCount="indefinite"
                  additive="sum"
                />
                <animate
                  attributeName="opacity"
                  values="0.8; 0.9; 0.8; 1; 0.8"
                  dur="10s"
                  repeatCount="indefinite"
                />
              </>
            )}
          </rect>
          
          {/* Third column of beams */}
          <rect
            x="720"
            y="-190"
            width="75"
            height="1180"
            fill="url(#beam2)"
            transform="rotate(-35 757 410)"
          >
            {animated && (
              <>
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0,0; -7,2; 0,0; 7,-2; 0,0"
                  dur="17s"
                  repeatCount="indefinite"
                  additive="sum"
                />
                <animate
                  attributeName="opacity"
                  values="0.9; 1; 0.8; 1; 0.9"
                  dur="6s"
                  repeatCount="indefinite"
                />
              </>
            )}
          </rect>
          <rect
            x="800"
            y="-170"
            width="85"
            height="1120"
            fill="url(#beam3)"
            transform="rotate(-33 842 440)"
          >
            {animated && (
              <>
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0,0; 5,-4; 0,0; -5,4; 0,0"
                  dur="20s"
                  repeatCount="indefinite"
                  additive="sum"
                />
                <animate
                  attributeName="opacity"
                  values="0.8; 0.9; 1; 0.9; 0.8"
                  dur="11s"
                  repeatCount="indefinite"
                />
              </>
            )}
          </rect>
          <rect
            x="650"
            y="-230"
            width="95"
            height="1280"
            fill="url(#beam5)"
            transform="rotate(-37 697 360)"
          >
            {animated && (
              <>
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0,0; 8,3; 0,0; -8,-3; 0,0"
                  dur="24s"
                  repeatCount="indefinite"
                  additive="sum"
                />
                <animate
                  attributeName="opacity"
                  values="0.9; 0.8; 0.9; 1; 0.9"
                  dur="7s"
                  repeatCount="indefinite"
                />
              </>
            )}
          </rect>
          
          {/* Fourth column of beams */}
          <rect
            x="980"
            y="-200"
            width="70"
            height="1200"
            fill="url(#beam4)"
            transform="rotate(-34 1015 400)"
          >
            {animated && (
              <>
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0,0; -6,5; 0,0; 6,-5; 0,0"
                  dur="18s"
                  repeatCount="indefinite"
                  additive="sum"
                />
                <animate
                  attributeName="opacity"
                  values="0.8; 1; 0.9; 1; 0.8"
                  dur="9s"
                  repeatCount="indefinite"
                />
              </>
            )}
          </rect>
          <rect
            x="1050"
            y="-160"
            width="80"
            height="1140"
            fill="url(#beam1)"
            transform="rotate(-36 1090 460)"
          >
            {animated && (
              <>
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0,0; 4,7; 0,0; -4,-7; 0,0"
                  dur="16s"
                  repeatCount="indefinite"
                  additive="sum"
                />
                <animate
                  attributeName="opacity"
                  values="0.9; 0.8; 1; 0.8; 0.9"
                  dur="8s"
                  repeatCount="indefinite"
                />
              </>
            )}
          </rect>
          <rect
            x="920"
            y="-240"
            width="65"
            height="1260"
            fill="url(#beam2)"
            transform="rotate(-32 952 380)"
          >
            {animated && (
              <>
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0,0; -3,8; 0,0; 3,-8; 0,0"
                  dur="23s"
                  repeatCount="indefinite"
                  additive="sum"
                />
                <animate
                  attributeName="opacity"
                  values="0.8; 0.9; 0.8; 1; 0.8"
                  dur="12s"
                  repeatCount="indefinite"
                />
              </>
            )}
          </rect>
        </g>
        
        {/* Subtle overlay for depth */}
        <rect
          width="100%"
          height="100%"
          fill="url(#overlay)"
        />
        
        <defs>
          <radialGradient id="overlay" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#0a0a0a" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#0a0a0a" stopOpacity="0.3" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}

export default StaticBeamsBackground;