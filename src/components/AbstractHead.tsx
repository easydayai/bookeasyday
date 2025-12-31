import { useEffect, useRef } from "react";

export const AbstractHead = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div 
      ref={containerRef}
      className="relative w-full flex items-center justify-center"
      style={{ height: "65vh", marginTop: "-5vh" }}
    >
      {/* Space ripple effect - environmental energy */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="animate-space-ripple absolute w-[800px] h-[800px] rounded-full bg-gradient-radial from-primary/5 via-electric-blue/3 to-transparent blur-3xl" />
        <div className="animate-space-ripple-delayed absolute w-[600px] h-[600px] rounded-full bg-gradient-radial from-teal/4 via-primary/2 to-transparent blur-2xl" />
      </div>

      {/* Main SVG Head */}
      <svg
        viewBox="0 0 400 500"
        className="relative z-10 w-auto animate-head-breathe"
        style={{ height: "100%", maxHeight: "550px" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Main gradient for the head */}
          <linearGradient id="headGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(270, 85%, 45%)" />
            <stop offset="30%" stopColor="hsl(250, 80%, 50%)" />
            <stop offset="50%" stopColor="hsl(200, 90%, 50%)" />
            <stop offset="70%" stopColor="hsl(175, 80%, 45%)" />
            <stop offset="100%" stopColor="hsl(150, 100%, 45%)" />
          </linearGradient>

          {/* Animated flowing gradient */}
          <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(280, 80%, 50%)" className="animate-gradient-shift-1" />
            <stop offset="50%" stopColor="hsl(200, 90%, 55%)" className="animate-gradient-shift-2" />
            <stop offset="100%" stopColor="hsl(320, 80%, 55%)" className="animate-gradient-shift-3" />
          </linearGradient>

          {/* Neural glow gradient */}
          <radialGradient id="neuralGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(200, 90%, 60%)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(270, 85%, 50%)" stopOpacity="0" />
          </radialGradient>

          {/* Node glow filter */}
          <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Soft shadow for depth */}
          <filter id="headShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="10" stdDeviation="20" floodColor="hsl(270, 85%, 45%)" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Abstract head silhouette - smooth flowing profile */}
        <g filter="url(#headShadow)" className="animate-head-float">
          <path
            d="M200 20
               C 280 20, 350 80, 360 160
               C 370 220, 360 280, 340 330
               C 320 380, 280 420, 240 450
               C 220 465, 200 475, 180 480
               C 160 475, 140 465, 120 450
               C 100 435, 85 415, 75 390
               C 60 350, 55 300, 60 250
               C 65 200, 80 150, 110 110
               C 140 70, 160 20, 200 20
               Z"
            fill="url(#headGradient)"
            className="animate-gradient-flow"
          />
          
          {/* Inner layer for depth */}
          <path
            d="M200 50
               C 260 50, 320 100, 330 170
               C 340 220, 330 270, 310 310
               C 290 350, 260 390, 220 420
               C 200 435, 180 440, 160 435
               C 140 425, 120 400, 105 370
               C 90 340, 85 300, 90 260
               C 95 220, 110 180, 140 150
               C 170 120, 170 50, 200 50
               Z"
            fill="url(#flowGradient)"
            opacity="0.4"
          />
        </g>

        {/* Neural network nodes */}
        <g className="animate-neural-pulse" filter="url(#nodeGlow)">
          {/* Primary nodes */}
          <circle cx="180" cy="120" r="4" fill="hsl(200, 90%, 70%)" opacity="0.8" />
          <circle cx="220" cy="140" r="3" fill="hsl(175, 80%, 60%)" opacity="0.7" />
          <circle cx="250" cy="180" r="5" fill="hsl(270, 85%, 65%)" opacity="0.9" />
          <circle cx="200" cy="200" r="4" fill="hsl(150, 100%, 55%)" opacity="0.8" />
          <circle cx="160" cy="180" r="3" fill="hsl(200, 90%, 65%)" opacity="0.7" />
          <circle cx="280" cy="220" r="4" fill="hsl(320, 80%, 60%)" opacity="0.6" />
          <circle cx="230" cy="250" r="5" fill="hsl(200, 90%, 60%)" opacity="0.8" />
          <circle cx="180" cy="260" r="3" fill="hsl(175, 80%, 55%)" opacity="0.7" />
          <circle cx="210" cy="300" r="4" fill="hsl(270, 85%, 60%)" opacity="0.75" />
          <circle cx="150" cy="240" r="3" fill="hsl(150, 100%, 50%)" opacity="0.6" />
          <circle cx="260" cy="290" r="3" fill="hsl(200, 90%, 55%)" opacity="0.65" />
          <circle cx="190" cy="350" r="4" fill="hsl(320, 80%, 55%)" opacity="0.7" />
          
          {/* Connection lines - subtle neural pathways */}
          <g stroke="hsl(200, 90%, 70%)" strokeWidth="0.5" opacity="0.3" fill="none">
            <path d="M180 120 Q 200 130, 220 140" />
            <path d="M220 140 Q 235 160, 250 180" />
            <path d="M250 180 Q 225 190, 200 200" />
            <path d="M200 200 Q 180 190, 160 180" />
            <path d="M160 180 Q 170 150, 180 120" />
            <path d="M250 180 Q 265 200, 280 220" />
            <path d="M280 220 Q 255 235, 230 250" />
            <path d="M230 250 Q 205 255, 180 260" />
            <path d="M180 260 Q 165 250, 150 240" />
            <path d="M200 200 Q 215 225, 230 250" />
            <path d="M230 250 Q 245 270, 260 290" />
            <path d="M230 250 Q 220 275, 210 300" />
            <path d="M210 300 Q 200 325, 190 350" />
            <path d="M180 260 Q 185 280, 190 350" />
          </g>
        </g>

        {/* Secondary ambient glow nodes */}
        <g className="animate-neural-pulse-delayed" opacity="0.5">
          <circle cx="290" cy="160" r="2" fill="hsl(175, 80%, 50%)" />
          <circle cx="130" cy="200" r="2" fill="hsl(270, 85%, 55%)" />
          <circle cx="240" cy="340" r="2" fill="hsl(200, 90%, 50%)" />
          <circle cx="140" cy="300" r="2" fill="hsl(150, 100%, 45%)" />
          <circle cx="270" cy="250" r="2" fill="hsl(320, 80%, 50%)" />
        </g>
      </svg>
    </div>
  );
};
