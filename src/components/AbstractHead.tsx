import abstractHeadImage from "@/assets/abstract-head.png";

export const AbstractHead = () => {
  return (
    <div className="w-full h-full overflow-hidden">
      <div className="relative w-full h-full flex items-center justify-center overflow-visible">
        {/* Space ripple effect - larger and more subtle (behind) */}
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-visible">
          <div className="animate-space-ripple absolute w-[150%] aspect-square rounded-full bg-gradient-radial from-primary/5 via-cyan/3 to-transparent blur-3xl" />
          <div className="animate-space-ripple-delayed absolute w-[120%] aspect-square rounded-full bg-gradient-radial from-magenta/4 via-primary/2 to-transparent blur-2xl" />
        </div>

        {/* Abstract Head Image - Hero Scale, no borders (middle) */}
        <div className="relative z-10 scale-[1.35] sm:scale-100">
          {/* Dark mode: white becomes transparent with mix-blend-multiply + invert */}
          <img
            src={abstractHeadImage}
            alt="Easy Day AI - Abstract head representing intelligent automation"
            className="animate-head-breathe h-auto object-contain border-0 outline-none dark:invert dark:hue-rotate-180"
            style={{
              maxHeight: "110vh",
              minHeight: "85vh",
              width: "auto",
              maxWidth: "100%",
            }}
          />
        </div>

        {/* Floating particles - positioned around the head area (in front) */}
        <div className="absolute inset-[-20%] z-20 pointer-events-none overflow-visible">
          {/* Top left cluster */}
          <div className="animate-particle-float-1 absolute top-[15%] left-[25%] w-2 h-2 rounded-full bg-primary/60 blur-[1px]" />
          <div className="animate-particle-float-2 absolute top-[10%] left-[35%] w-3 h-3 rounded-full bg-cyan/50 blur-[1px]" />
          <div className="animate-particle-float-3 absolute top-[20%] left-[20%] w-1.5 h-1.5 rounded-full bg-magenta/60 blur-[0.5px]" />

          {/* Top right cluster */}
          <div className="animate-particle-float-2 absolute top-[12%] right-[28%] w-2.5 h-2.5 rounded-full bg-electric-blue/50 blur-[1px]" />
          <div className="animate-particle-float-1 absolute top-[18%] right-[22%] w-2 h-2 rounded-full bg-orange/50 blur-[1px]" />
          <div className="animate-particle-float-3 absolute top-[8%] right-[35%] w-1.5 h-1.5 rounded-full bg-cyan/60 blur-[0.5px]" />

          {/* Additional scattered particles */}
          <div className="animate-particle-float-1 absolute top-[25%] left-[15%] w-1.5 h-1.5 rounded-full bg-primary/40 blur-[0.5px]" />
          <div className="animate-particle-float-2 absolute top-[5%] left-[45%] w-2 h-2 rounded-full bg-magenta/40 blur-[1px]" />

          {/* Mobile-only lower particles */}
          <div className="sm:hidden animate-particle-float-1 absolute bottom-[15%] left-[20%] w-1.5 h-1.5 rounded-full bg-primary/50 blur-[0.5px]" />
          <div className="sm:hidden animate-particle-float-2 absolute bottom-[20%] left-[35%] w-2 h-2 rounded-full bg-cyan/40 blur-[1px]" />
          <div className="sm:hidden animate-particle-float-3 absolute bottom-[12%] left-[50%] w-1.5 h-1.5 rounded-full bg-magenta/50 blur-[0.5px]" />
          <div className="sm:hidden animate-particle-float-1 absolute bottom-[25%] right-[25%] w-2 h-2 rounded-full bg-electric-blue/40 blur-[1px]" />
          <div className="sm:hidden animate-particle-float-2 absolute bottom-[18%] right-[40%] w-1.5 h-1.5 rounded-full bg-orange/50 blur-[0.5px]" />
          <div className="sm:hidden animate-particle-float-3 absolute bottom-[10%] right-[15%] w-2 h-2 rounded-full bg-cyan/50 blur-[1px]" />
          <div className="sm:hidden animate-particle-float-1 absolute bottom-[22%] left-[10%] w-1 h-1 rounded-full bg-primary/60 blur-[0.5px]" />
          <div className="sm:hidden animate-particle-float-2 absolute bottom-[8%] left-[60%] w-1.5 h-1.5 rounded-full bg-magenta/40 blur-[0.5px]" />
        </div>
      </div>
    </div>
  );
};
