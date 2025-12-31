export const AbstractHead = () => {
  return (
    <div 
      className="relative w-full flex items-center justify-center overflow-visible"
      style={{ height: "70vh", marginTop: "-5vh" }}
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

      {/* Human Profile SVG - Side view facing RIGHT with nose, lips, chin */}
      <svg
        viewBox="0 0 420 520"
        className="relative z-10 w-auto animate-head-breathe"
        style={{ height: "100%", maxHeight: "580px" }}
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

        {/* Layer 1 - Outermost - CLEAR PROFILE: forehead→brow→nose→lips→chin→jaw→neck */}
        <g filter="url(#shadow)" className="animate-head-float">
          <path
            d="M85 25
               C 50 35, 25 75, 20 130
               C 15 185, 22 235, 35 275
               C 48 315, 68 350, 92 380
               L 115 408
               C 140 435, 172 455, 210 462
               L 250 465
               C 275 463, 295 452, 308 432
               L 318 408
               L 322 385
               L 318 365
               L 305 350
               L 325 325
               L 350 285
               L 368 245
               L 378 210
               L 380 175
               L 372 145
               L 355 120
               L 330 100
               L 295 82
               L 250 68
               L 200 55
               L 145 40
               L 85 25
               Z"
            fill="url(#grad1)"
            className="animate-gradient-flow"
          />

          {/* Layer 2 */}
          <path
            d="M98 48
               C 66 57, 44 93, 40 143
               C 36 193, 42 238, 54 275
               C 66 312, 84 344, 106 372
               L 127 397
               C 150 422, 178 440, 213 446
               L 248 449
               C 271 447, 289 438, 301 420
               L 310 398
               L 313 377
               L 310 359
               L 298 345
               L 316 322
               L 339 285
               L 355 248
               L 364 216
               L 366 183
               L 359 155
               L 343 132
               L 320 113
               L 288 97
               L 248 84
               L 202 72
               L 152 58
               L 98 48
               Z"
            fill="url(#grad2)"
            opacity="0.95"
          />

          {/* Layer 3 */}
          <path
            d="M112 72
               C 83 80, 64 112, 60 157
               C 56 202, 62 243, 72 277
               C 82 311, 99 340, 119 365
               L 138 388
               C 159 410, 185 426, 217 432
               L 248 434
               C 269 433, 285 425, 296 409
               L 304 389
               L 307 370
               L 304 354
               L 293 341
               L 309 320
               L 330 286
               L 344 252
               L 352 222
               L 354 192
               L 348 166
               L 333 145
               L 312 128
               L 282 113
               L 246 102
               L 204 91
               L 158 79
               L 112 72
               Z"
            fill="url(#grad3)"
            opacity="0.92"
          />

          {/* Layer 4 */}
          <path
            d="M128 98
               C 102 105, 85 133, 82 173
               C 79 213, 84 250, 93 281
               C 102 312, 117 338, 135 360
               L 152 381
               C 171 401, 194 414, 223 420
               L 250 421
               C 268 420, 283 414, 292 400
               L 299 382
               L 302 365
               L 299 350
               L 289 339
               L 303 320
               L 322 289
               L 334 258
               L 341 230
               L 342 203
               L 337 179
               L 324 160
               L 304 144
               L 277 131
               L 245 121
               L 206 112
               L 165 103
               L 128 98
               Z"
            fill="url(#grad4)"
            opacity="0.9"
          />

          {/* Layer 5 */}
          <path
            d="M148 128
               C 125 134, 110 158, 107 193
               C 104 228, 108 261, 116 289
               C 124 317, 137 340, 153 359
               L 168 377
               C 185 394, 205 406, 230 410
               L 254 412
               C 270 411, 283 406, 291 394
               L 297 378
               L 300 363
               L 297 350
               L 288 340
               L 300 323
               L 316 296
               L 327 268
               L 333 243
               L 334 218
               L 330 197
               L 318 180
               L 300 166
               L 276 154
               L 248 146
               L 212 138
               L 178 132
               L 148 128
               Z"
            fill="url(#grad5)"
            opacity="0.88"
          />

          {/* Layer 6 */}
          <path
            d="M170 162
               C 150 167, 137 188, 135 218
               C 133 248, 136 277, 143 302
               C 150 327, 162 347, 175 363
               L 188 378
               C 203 392, 220 402, 242 405
               L 262 407
               C 276 406, 287 402, 294 392
               L 299 378
               L 301 365
               L 299 354
               L 291 345
               L 301 330
               L 315 307
               L 324 282
               L 329 259
               L 330 238
               L 326 219
               L 316 204
               L 300 191
               L 279 181
               L 255 174
               L 223 168
               L 195 164
               L 170 162
               Z"
            fill="url(#grad6)"
            opacity="0.85"
          />

          {/* Layer 7 - Innermost */}
          <path
            d="M195 200
               C 178 204, 168 222, 166 247
               C 164 272, 167 296, 173 317
               C 179 338, 189 354, 200 367
               L 211 379
               C 223 390, 238 398, 256 400
               L 272 401
               C 283 401, 292 397, 298 389
               L 302 377
               L 304 366
               L 302 357
               L 295 350
               L 303 338
               L 314 319
               L 322 298
               L 326 278
               L 327 260
               L 324 244
               L 316 231
               L 302 220
               L 284 211
               L 263 205
               L 238 201
               L 215 199
               L 195 200
               Z"
            fill="url(#grad7)"
            opacity="0.82"
          />
        </g>

        {/* Neural network nodes */}
        <g className="animate-neural-pulse" filter="url(#glow)">
          <circle cx="130" cy="140" r="4" fill="hsl(200, 100%, 80%)" opacity="0.95" />
          <circle cx="165" cy="160" r="5" fill="hsl(195, 100%, 85%)" opacity="0.9" />
          <circle cx="200" cy="180" r="4" fill="hsl(180, 90%, 75%)" opacity="0.85" />
          <circle cx="150" cy="195" r="5" fill="hsl(200, 100%, 82%)" opacity="0.92" />
          <circle cx="185" cy="220" r="5" fill="hsl(190, 95%, 80%)" opacity="0.9" />
          <circle cx="140" cy="240" r="4" fill="hsl(185, 90%, 75%)" opacity="0.85" />
          <circle cx="170" cy="265" r="4" fill="hsl(200, 100%, 78%)" opacity="0.88" />
          <circle cx="210" cy="245" r="3" fill="hsl(195, 95%, 82%)" opacity="0.82" />
          <circle cx="155" cy="290" r="4" fill="hsl(180, 90%, 72%)" opacity="0.8" />
          <circle cx="115" cy="170" r="3" fill="hsl(200, 100%, 85%)" opacity="0.75" />
          <circle cx="230" cy="210" r="3" fill="hsl(175, 85%, 70%)" opacity="0.7" />
          
          <g stroke="hsl(200, 100%, 80%)" strokeWidth="1" opacity="0.3" fill="none">
            <path d="M130 140 Q 148 150, 165 160" />
            <path d="M165 160 Q 183 170, 200 180" />
            <path d="M165 160 Q 158 178, 150 195" />
            <path d="M150 195 Q 168 208, 185 220" />
            <path d="M185 220 Q 163 230, 140 240" />
            <path d="M140 240 Q 155 253, 170 265" />
            <path d="M170 265 Q 163 278, 155 290" />
            <path d="M185 220 Q 198 233, 210 245" />
            <path d="M200 180 Q 215 195, 230 210" />
            <path d="M130 140 Q 123 155, 115 170" />
          </g>
        </g>

        {/* Ambient nodes */}
        <g className="animate-neural-pulse-delayed" opacity="0.5">
          <circle cx="100" cy="108" r="2.5" fill="hsl(270, 80%, 70%)" />
          <circle cx="248" cy="165" r="2" fill="hsl(200, 90%, 65%)" />
          <circle cx="242" cy="275" r="2.5" fill="hsl(180, 85%, 60%)" />
          <circle cx="108" cy="275" r="2" fill="hsl(50, 80%, 65%)" />
          <circle cx="180" cy="320" r="2" fill="hsl(20, 90%, 60%)" />
          <circle cx="128" cy="340" r="2.5" fill="hsl(340, 80%, 65%)" />
        </g>
      </svg>
    </div>
  );
};
