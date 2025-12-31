export const AbstractHead = () => {
  return (
    <div 
      className="relative w-full flex items-center justify-center overflow-visible"
      style={{ height: "75vh", marginTop: "-8vh" }}
    >
      {/* Space ripple effect */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="animate-space-ripple absolute w-[900px] h-[900px] rounded-full bg-gradient-radial from-primary/6 via-electric-blue/4 to-transparent blur-3xl" />
        <div className="animate-space-ripple-delayed absolute w-[700px] h-[700px] rounded-full bg-gradient-radial from-teal/5 via-primary/3 to-transparent blur-2xl" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="animate-particle-float-1 absolute top-[12%] left-[30%] w-2 h-2 rounded-full bg-primary/60 blur-[1px]" />
        <div className="animate-particle-float-2 absolute top-[8%] left-[40%] w-3 h-3 rounded-full bg-electric-blue/50 blur-[2px]" />
        <div className="animate-particle-float-3 absolute top-[18%] left-[25%] w-1.5 h-1.5 rounded-full bg-teal/70 blur-[1px]" />
        <div className="animate-particle-float-1 absolute top-[5%] left-[45%] w-2.5 h-2.5 rounded-full bg-primary/40 blur-[1px]" />
        <div className="animate-particle-float-2 absolute top-[22%] left-[20%] w-2 h-2 rounded-full bg-electric-blue/60 blur-[1px]" />
      </div>

      {/* Main SVG Head - True Human Profile */}
      <svg
        viewBox="0 0 350 450"
        className="relative z-10 w-auto animate-head-breathe"
        style={{ height: "100%", maxHeight: "600px" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(275, 85%, 35%)" />
            <stop offset="100%" stopColor="hsl(250, 80%, 45%)" />
          </linearGradient>
          <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(250, 80%, 48%)" />
            <stop offset="100%" stopColor="hsl(215, 90%, 55%)" />
          </linearGradient>
          <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(215, 90%, 55%)" />
            <stop offset="100%" stopColor="hsl(185, 85%, 50%)" />
          </linearGradient>
          <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(185, 85%, 50%)" />
            <stop offset="100%" stopColor="hsl(160, 80%, 48%)" />
          </linearGradient>
          <linearGradient id="grad5" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(160, 80%, 48%)" />
            <stop offset="100%" stopColor="hsl(50, 90%, 55%)" />
          </linearGradient>
          <linearGradient id="grad6" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(50, 90%, 55%)" />
            <stop offset="100%" stopColor="hsl(25, 95%, 55%)" />
          </linearGradient>
          <linearGradient id="grad7" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(25, 95%, 55%)" />
            <stop offset="50%" stopColor="hsl(345, 85%, 55%)" />
            <stop offset="100%" stopColor="hsl(320, 80%, 58%)" />
          </linearGradient>

          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="12" stdDeviation="25" floodColor="hsl(270, 85%, 40%)" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Human Head Profile - Side view facing RIGHT with clear facial features */}
        <g filter="url(#shadow)" className="animate-head-float">
          
          {/* Layer 1 - Outermost (Deep Purple) - Full head silhouette */}
          <path
            d="M75 35
               C 45 45, 25 80, 20 130
               C 15 180, 20 230, 30 270
               C 40 310, 55 340, 70 365
               L 85 390
               L 100 410
               C 115 425, 135 435, 160 440
               L 200 445
               L 210 445
               C 220 445, 230 442, 238 435
               L 245 425
               C 250 415, 252 400, 248 385
               L 245 370
               C 265 355, 285 330, 295 300
               L 305 270
               C 320 230, 325 185, 318 145
               C 310 105, 290 70, 260 50
               C 230 30, 195 25, 160 25
               C 125 25, 100 28, 75 35
               Z"
            fill="url(#grad1)"
            className="animate-gradient-flow"
          />

          {/* Layer 2 - Indigo/Blue */}
          <path
            d="M85 52
               C 58 62, 40 94, 36 140
               C 32 186, 36 232, 45 268
               C 54 304, 68 332, 82 355
               L 95 378
               L 108 396
               C 122 410, 140 419, 162 423
               L 198 427
               L 207 427
               C 216 427, 225 424, 232 418
               L 238 409
               C 243 400, 244 387, 241 374
               L 238 361
               C 256 348, 274 325, 283 298
               L 292 270
               C 305 234, 310 192, 303 155
               C 296 118, 278 86, 250 68
               C 222 50, 190 45, 158 45
               C 126 45, 104 47, 85 52
               Z"
            fill="url(#grad2)"
            opacity="0.95"
          />

          {/* Layer 3 - Blue/Cyan */}
          <path
            d="M96 72
               C 72 80, 56 110, 52 152
               C 48 194, 52 236, 60 268
               C 68 300, 80 326, 93 346
               L 105 366
               L 116 382
               C 128 394, 144 402, 164 406
               L 196 409
               L 204 409
               C 212 409, 220 407, 226 401
               L 231 393
               C 235 385, 237 374, 234 363
               L 232 352
               C 248 340, 264 320, 272 296
               L 280 270
               C 291 238, 295 200, 289 166
               C 283 132, 267 103, 242 87
               C 217 71, 188 66, 158 66
               C 128 66, 110 68, 96 72
               Z"
            fill="url(#grad3)"
            opacity="0.92"
          />

          {/* Layer 4 - Cyan/Teal */}
          <path
            d="M108 94
               C 86 101, 72 128, 68 166
               C 64 204, 68 242, 75 270
               C 82 298, 93 320, 105 338
               L 115 356
               L 125 369
               C 136 380, 150 387, 168 390
               L 194 393
               L 201 393
               C 208 393, 215 391, 221 386
               L 225 379
               C 229 372, 230 363, 228 353
               L 226 344
               C 240 334, 254 316, 261 295
               L 268 272
               C 278 244, 281 210, 276 179
               C 271 148, 257 122, 235 108
               C 213 94, 186 90, 160 90
               C 134 90, 120 91, 108 94
               Z"
            fill="url(#grad4)"
            opacity="0.9"
          />

          {/* Layer 5 - Teal/Yellow */}
          <path
            d="M122 118
               C 102 124, 90 148, 86 182
               C 82 216, 86 250, 92 274
               C 98 298, 108 318, 118 333
               L 127 348
               L 136 359
               C 146 368, 158 374, 173 377
               L 194 379
               L 200 379
               C 206 379, 212 378, 217 373
               L 221 367
               C 224 361, 225 354, 223 345
               L 222 338
               C 234 329, 246 314, 252 296
               L 258 276
               C 266 252, 269 222, 265 195
               C 261 168, 249 144, 230 132
               C 211 120, 188 116, 165 116
               C 142 116, 130 117, 122 118
               Z"
            fill="url(#grad5)"
            opacity="0.88"
          />

          {/* Layer 6 - Yellow/Orange */}
          <path
            d="M138 145
               C 120 150, 110 171, 106 200
               C 102 229, 105 258, 110 279
               C 115 300, 124 317, 133 330
               L 140 342
               L 148 352
               C 156 360, 167 365, 179 367
               L 195 369
               L 200 369
               C 205 369, 210 368, 214 364
               L 217 359
               C 220 354, 221 348, 219 341
               L 218 335
               C 228 328, 238 315, 244 300
               L 248 283
               C 255 262, 257 237, 254 214
               C 251 191, 241 170, 225 160
               C 209 150, 190 147, 170 147
               C 150 147, 144 146, 138 145
               Z"
            fill="url(#grad6)"
            opacity="0.85"
          />

          {/* Layer 7 - Orange/Magenta/Pink (innermost) */}
          <path
            d="M156 175
               C 140 179, 132 197, 129 222
               C 126 247, 128 272, 133 290
               C 138 308, 145 322, 153 332
               L 159 342
               L 166 350
               C 173 357, 182 361, 192 362
               L 204 363
               L 208 363
               C 212 363, 216 362, 219 359
               L 222 355
               C 224 351, 225 346, 224 340
               L 223 335
               C 231 329, 240 318, 244 305
               L 248 291
               C 253 274, 255 254, 252 235
               C 249 216, 242 199, 229 190
               C 216 181, 200 178, 183 178
               C 166 178, 161 176, 156 175
               Z"
            fill="url(#grad7)"
            opacity="0.82"
          />
        </g>

        {/* Neural network nodes in brain area */}
        <g className="animate-neural-pulse" filter="url(#glow)">
          <circle cx="140" cy="150" r="4" fill="hsl(200, 100%, 80%)" opacity="0.95" />
          <circle cx="170" cy="165" r="5" fill="hsl(195, 100%, 85%)" opacity="0.9" />
          <circle cx="200" cy="180" r="4" fill="hsl(180, 90%, 75%)" opacity="0.85" />
          <circle cx="155" cy="195" r="5" fill="hsl(200, 100%, 82%)" opacity="0.92" />
          <circle cx="185" cy="215" r="5" fill="hsl(190, 95%, 80%)" opacity="0.9" />
          <circle cx="145" cy="230" r="4" fill="hsl(185, 90%, 75%)" opacity="0.85" />
          <circle cx="170" cy="250" r="4" fill="hsl(200, 100%, 78%)" opacity="0.88" />
          <circle cx="205" cy="235" r="3" fill="hsl(195, 95%, 82%)" opacity="0.82" />
          <circle cx="160" cy="275" r="4" fill="hsl(180, 90%, 72%)" opacity="0.8" />
          <circle cx="125" cy="170" r="3" fill="hsl(200, 100%, 85%)" opacity="0.75" />
          <circle cx="220" cy="205" r="3" fill="hsl(175, 85%, 70%)" opacity="0.7" />
          
          {/* Neural connections */}
          <g stroke="hsl(200, 100%, 80%)" strokeWidth="1" opacity="0.3" fill="none">
            <path d="M140 150 Q 155 158, 170 165" />
            <path d="M170 165 Q 185 173, 200 180" />
            <path d="M170 165 Q 163 180, 155 195" />
            <path d="M155 195 Q 170 205, 185 215" />
            <path d="M185 215 Q 165 223, 145 230" />
            <path d="M145 230 Q 158 240, 170 250" />
            <path d="M170 250 Q 165 263, 160 275" />
            <path d="M185 215 Q 195 225, 205 235" />
            <path d="M200 180 Q 210 193, 220 205" />
            <path d="M140 150 Q 133 160, 125 170" />
          </g>
        </g>

        {/* Ambient glow nodes */}
        <g className="animate-neural-pulse-delayed" opacity="0.5">
          <circle cx="110" cy="120" r="2.5" fill="hsl(270, 80%, 70%)" />
          <circle cx="235" cy="165" r="2" fill="hsl(200, 90%, 65%)" />
          <circle cx="230" cy="260" r="2.5" fill="hsl(180, 85%, 60%)" />
          <circle cx="120" cy="260" r="2" fill="hsl(50, 80%, 65%)" />
          <circle cx="180" cy="305" r="2" fill="hsl(20, 90%, 60%)" />
          <circle cx="135" cy="320" r="2.5" fill="hsl(340, 80%, 65%)" />
        </g>
      </svg>
    </div>
  );
};
