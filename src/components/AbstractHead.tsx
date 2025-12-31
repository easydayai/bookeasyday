export const AbstractHead = () => {
  return (
    <div 
      className="relative w-full flex items-center justify-center overflow-visible"
      style={{ height: "75vh", marginTop: "-8vh" }}
    >
      {/* Space ripple effect - environmental energy */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="animate-space-ripple absolute w-[900px] h-[900px] rounded-full bg-gradient-radial from-primary/6 via-electric-blue/4 to-transparent blur-3xl" />
        <div className="animate-space-ripple-delayed absolute w-[700px] h-[700px] rounded-full bg-gradient-radial from-teal/5 via-primary/3 to-transparent blur-2xl" />
      </div>

      {/* Floating particles around head */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="animate-particle-float-1 absolute top-[15%] left-[25%] w-2 h-2 rounded-full bg-primary/60 blur-[1px]" />
        <div className="animate-particle-float-2 absolute top-[10%] left-[35%] w-3 h-3 rounded-full bg-electric-blue/50 blur-[2px]" />
        <div className="animate-particle-float-3 absolute top-[20%] left-[20%] w-1.5 h-1.5 rounded-full bg-teal/70 blur-[1px]" />
        <div className="animate-particle-float-1 absolute top-[8%] left-[40%] w-2.5 h-2.5 rounded-full bg-primary/40 blur-[1px]" />
        <div className="animate-particle-float-2 absolute top-[25%] left-[15%] w-2 h-2 rounded-full bg-electric-blue/60 blur-[1px]" />
        <div className="animate-particle-float-3 absolute top-[12%] left-[30%] w-1 h-1 rounded-full bg-neon-green/50 blur-[0.5px]" />
        <div className="animate-particle-float-1 absolute top-[18%] left-[45%] w-1.5 h-1.5 rounded-full bg-teal/40 blur-[1px]" />
        <div className="animate-particle-float-2 absolute top-[5%] left-[28%] w-2 h-2 rounded-full bg-primary/50 blur-[1px]" />
      </div>

      {/* Main SVG Head - Flowing Ribbon Profile */}
      <svg
        viewBox="0 0 500 600"
        className="relative z-10 w-auto animate-head-breathe"
        style={{ height: "100%", maxHeight: "650px" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Outer ribbon gradient - Deep purple to indigo */}
          <linearGradient id="ribbon1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(270, 85%, 40%)" />
            <stop offset="50%" stopColor="hsl(260, 80%, 45%)" />
            <stop offset="100%" stopColor="hsl(250, 75%, 50%)" />
          </linearGradient>

          {/* Second ribbon - Indigo to blue */}
          <linearGradient id="ribbon2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(250, 80%, 50%)" />
            <stop offset="50%" stopColor="hsl(230, 85%, 55%)" />
            <stop offset="100%" stopColor="hsl(210, 90%, 55%)" />
          </linearGradient>

          {/* Third ribbon - Blue to cyan */}
          <linearGradient id="ribbon3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(210, 90%, 55%)" />
            <stop offset="50%" stopColor="hsl(195, 85%, 50%)" />
            <stop offset="100%" stopColor="hsl(180, 80%, 50%)" />
          </linearGradient>

          {/* Fourth ribbon - Cyan to teal */}
          <linearGradient id="ribbon4" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(180, 80%, 50%)" />
            <stop offset="50%" stopColor="hsl(170, 75%, 48%)" />
            <stop offset="100%" stopColor="hsl(160, 70%, 45%)" />
          </linearGradient>

          {/* Fifth ribbon - Teal to yellow-green */}
          <linearGradient id="ribbon5" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(160, 70%, 45%)" />
            <stop offset="50%" stopColor="hsl(80, 70%, 50%)" />
            <stop offset="100%" stopColor="hsl(50, 80%, 55%)" />
          </linearGradient>

          {/* Sixth ribbon - Yellow to orange */}
          <linearGradient id="ribbon6" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(50, 80%, 55%)" />
            <stop offset="50%" stopColor="hsl(35, 90%, 55%)" />
            <stop offset="100%" stopColor="hsl(20, 95%, 55%)" />
          </linearGradient>

          {/* Seventh ribbon - Orange to magenta/pink */}
          <linearGradient id="ribbon7" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(20, 95%, 55%)" />
            <stop offset="50%" stopColor="hsl(340, 85%, 55%)" />
            <stop offset="100%" stopColor="hsl(330, 80%, 60%)" />
          </linearGradient>

          {/* Neural glow gradient */}
          <radialGradient id="neuralGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(200, 100%, 80%)" stopOpacity="0.9" />
            <stop offset="40%" stopColor="hsl(200, 90%, 60%)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="hsl(270, 85%, 50%)" stopOpacity="0" />
          </radialGradient>

          {/* Node glow filter */}
          <filter id="nodeGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Soft drop shadow */}
          <filter id="headShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="15" stdDeviation="30" floodColor="hsl(270, 85%, 45%)" floodOpacity="0.12" />
          </filter>

          {/* Ribbon shimmer */}
          <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="50%" stopColor="white" stopOpacity="0.15" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Head silhouette composed of flowing ribbons */}
        <g filter="url(#headShadow)" className="animate-head-float">
          
          {/* Outermost ribbon layer - Purple (back of head) */}
          <path
            d="M180 30
               C 120 50, 80 120, 70 200
               C 60 280, 70 360, 100 420
               C 130 480, 180 520, 240 540
               C 280 550, 320 545, 360 520
               C 400 495, 420 450, 400 400
               C 380 350, 340 320, 300 280
               C 260 240, 280 180, 320 140
               C 360 100, 350 60, 300 40
               C 260 20, 220 20, 180 30
               Z"
            fill="url(#ribbon1)"
            className="animate-gradient-flow"
          />

          {/* Second ribbon layer - Indigo/Blue */}
          <path
            d="M190 50
               C 140 70, 100 130, 90 200
               C 80 270, 90 340, 115 395
               C 140 450, 185 490, 240 510
               C 280 522, 315 518, 350 495
               C 385 472, 395 430, 380 385
               C 365 340, 330 305, 295 270
               C 260 235, 275 180, 310 145
               C 345 110, 340 75, 295 55
               C 260 40, 225 40, 190 50
               Z"
            fill="url(#ribbon2)"
            opacity="0.95"
          />

          {/* Third ribbon layer - Blue/Cyan */}
          <path
            d="M200 70
               C 155 88, 120 145, 110 205
               C 100 265, 108 325, 130 375
               C 155 425, 195 460, 245 480
               C 282 494, 312 490, 342 470
               C 372 450, 380 412, 365 370
               C 350 328, 320 295, 290 262
               C 260 229, 272 180, 302 150
               C 332 120, 328 90, 290 72
               C 260 58, 235 58, 200 70
               Z"
            fill="url(#ribbon3)"
            opacity="0.92"
          />

          {/* Fourth ribbon layer - Cyan/Teal (brain area) */}
          <path
            d="M210 90
               C 170 105, 140 158, 130 210
               C 120 262, 127 310, 148 355
               C 170 400, 207 432, 250 450
               C 285 465, 310 462, 336 445
               C 362 428, 368 395, 355 358
               C 342 320, 315 290, 288 260
               C 261 230, 270 185, 296 158
               C 322 131, 320 105, 286 90
               C 258 78, 245 78, 210 90
               Z"
            fill="url(#ribbon4)"
            opacity="0.9"
          />

          {/* Fifth ribbon layer - Teal/Green-Yellow */}
          <path
            d="M220 110
               C 185 122, 160 168, 152 215
               C 144 262, 150 305, 168 345
               C 188 385, 220 412, 255 428
               C 288 443, 308 440, 330 425
               C 352 410, 356 382, 345 350
               C 334 318, 312 290, 288 262
               C 264 234, 272 195, 294 170
               C 316 145, 315 122, 285 110
               C 260 100, 250 100, 220 110
               Z"
            fill="url(#ribbon5)"
            opacity="0.88"
          />

          {/* Sixth ribbon - Yellow/Orange (lower face/neck) */}
          <path
            d="M230 130
               C 200 140, 178 180, 172 220
               C 166 260, 172 298, 188 335
               C 206 372, 235 395, 265 410
               C 292 423, 310 420, 328 407
               C 346 394, 350 370, 340 342
               C 330 314, 310 288, 290 264
               C 270 240, 278 205, 296 182
               C 314 159, 312 140, 285 130
               C 262 122, 255 122, 230 130
               Z"
            fill="url(#ribbon6)"
            opacity="0.85"
          />

          {/* Innermost ribbon - Orange/Magenta/Pink (core glow) */}
          <path
            d="M240 150
               C 215 158, 195 192, 190 228
               C 185 264, 192 298, 206 330
               C 222 362, 248 382, 275 395
               C 298 406, 315 404, 330 392
               C 345 380, 348 360, 340 335
               C 332 310, 315 286, 298 265
               C 281 244, 286 215, 302 195
               C 318 175, 316 158, 292 150
               C 272 144, 262 144, 240 150
               Z"
            fill="url(#ribbon7)"
            opacity="0.82"
          />

          {/* Shimmer overlay on main ribbon */}
          <path
            d="M200 70
               C 155 88, 120 145, 110 205
               C 100 265, 108 325, 130 375
               C 155 425, 195 460, 245 480
               C 282 494, 312 490, 342 470
               C 372 450, 380 412, 365 370
               C 350 328, 320 295, 290 262
               C 260 229, 272 180, 302 150
               C 332 120, 328 90, 290 72
               C 260 58, 235 58, 200 70
               Z"
            fill="url(#shimmer)"
            className="animate-ribbon-shimmer"
            opacity="0.4"
          />
        </g>

        {/* Neural network nodes - concentrated in brain area */}
        <g className="animate-neural-pulse" filter="url(#nodeGlow)">
          {/* Primary bright nodes */}
          <circle cx="220" cy="150" r="5" fill="hsl(200, 100%, 80%)" opacity="0.95" />
          <circle cx="260" cy="165" r="6" fill="hsl(195, 100%, 85%)" opacity="0.9" />
          <circle cx="295" cy="185" r="4" fill="hsl(180, 90%, 75%)" opacity="0.85" />
          <circle cx="240" cy="195" r="5" fill="hsl(200, 100%, 82%)" opacity="0.92" />
          <circle cx="275" cy="220" r="6" fill="hsl(190, 95%, 80%)" opacity="0.9" />
          <circle cx="230" cy="235" r="4" fill="hsl(185, 90%, 75%)" opacity="0.85" />
          <circle cx="260" cy="260" r="5" fill="hsl(200, 100%, 78%)" opacity="0.88" />
          <circle cx="290" cy="245" r="4" fill="hsl(195, 95%, 82%)" opacity="0.82" />
          <circle cx="245" cy="290" r="5" fill="hsl(180, 90%, 72%)" opacity="0.8" />
          <circle cx="210" cy="180" r="3" fill="hsl(200, 100%, 85%)" opacity="0.75" />
          <circle cx="305" cy="210" r="3" fill="hsl(175, 85%, 70%)" opacity="0.7" />
          
          {/* Neural connection lines */}
          <g stroke="hsl(200, 100%, 80%)" strokeWidth="1" opacity="0.35" fill="none">
            <path d="M220 150 Q 240 158, 260 165" />
            <path d="M260 165 Q 278 175, 295 185" />
            <path d="M260 165 Q 250 180, 240 195" />
            <path d="M240 195 Q 258 208, 275 220" />
            <path d="M275 220 Q 252 228, 230 235" />
            <path d="M230 235 Q 245 248, 260 260" />
            <path d="M260 260 Q 253 275, 245 290" />
            <path d="M275 220 Q 283 233, 290 245" />
            <path d="M295 185 Q 300 198, 305 210" />
            <path d="M220 150 Q 215 165, 210 180" />
            <path d="M240 195 Q 225 215, 230 235" />
          </g>
        </g>

        {/* Secondary ambient glow nodes */}
        <g className="animate-neural-pulse-delayed" opacity="0.5">
          <circle cx="185" cy="120" r="2.5" fill="hsl(270, 80%, 70%)" />
          <circle cx="320" cy="160" r="2" fill="hsl(200, 90%, 65%)" />
          <circle cx="330" cy="230" r="2.5" fill="hsl(180, 85%, 60%)" />
          <circle cx="200" cy="260" r="2" fill="hsl(50, 80%, 65%)" />
          <circle cx="280" cy="300" r="2" fill="hsl(20, 90%, 60%)" />
          <circle cx="220" cy="320" r="2.5" fill="hsl(340, 80%, 65%)" />
        </g>
      </svg>
    </div>
  );
};
