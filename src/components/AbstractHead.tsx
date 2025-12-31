import abstractHeadImage from "@/assets/abstract-head.png";

export const AbstractHead = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-visible">
      {/* Grain overlay for texture */}
      <div 
        className="absolute inset-0 z-30 pointer-events-none opacity-[0.15] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Space ripple effect - larger and more subtle (behind) */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-visible">
        <div className="animate-space-ripple absolute w-[150%] aspect-square rounded-full bg-gradient-radial from-primary/5 via-cyan/3 to-transparent blur-3xl" />
        <div className="animate-space-ripple-delayed absolute w-[120%] aspect-square rounded-full bg-gradient-radial from-magenta/4 via-primary/2 to-transparent blur-2xl" />
      </div>

      {/* Abstract Head Image - Hero Scale, no borders (middle) */}
      <img
        src={abstractHeadImage}
        alt="Easy Day AI - Abstract head representing intelligent automation"
        className="animate-head-breathe relative z-10 h-auto object-contain border-0 outline-none"
        style={{
          maxHeight: "100vh",
          minHeight: "80vh",
          width: "auto",
          maxWidth: "110%",
        }}
      />

      {/* Floating particles - positioned around the head area (in front) */}
      <div className="absolute inset-[-20%] z-20 pointer-events-none overflow-visible">
        {/* Top left cluster */}
        <div className="animate-particle-float-1 absolute top-[15%] left-[25%] w-2 h-2 rounded-full bg-primary/60 blur-[1px]" />
        <div className="animate-particle-float-2 absolute top-[10%] left-[35%] w-3 h-3 rounded-full bg-cyan/50 blur-[1px]" />
        <div className="animate-particle-float-3 absolute top-[20%] left-[20%] w-1.5 h-1.5 rounded-full bg-magenta/60 blur-[0.5px]" />
        <div className="animate-particle-float-1 absolute top-[8%] left-[28%] w-1 h-1 rounded-full bg-electric-blue/70 blur-[0.5px]" />
        <div className="animate-particle-float-2 absolute top-[22%] left-[32%] w-2 h-2 rounded-full bg-teal/50 blur-[1px]" />

        {/* Top right cluster */}
        <div className="animate-particle-float-2 absolute top-[12%] right-[28%] w-2.5 h-2.5 rounded-full bg-electric-blue/50 blur-[1px]" />
        <div className="animate-particle-float-1 absolute top-[18%] right-[22%] w-2 h-2 rounded-full bg-orange/50 blur-[1px]" />
        <div className="animate-particle-float-3 absolute top-[8%] right-[35%] w-1.5 h-1.5 rounded-full bg-cyan/60 blur-[0.5px]" />
        <div className="animate-particle-float-2 absolute top-[25%] right-[30%] w-1 h-1 rounded-full bg-primary/70 blur-[0.5px]" />
        <div className="animate-particle-float-1 absolute top-[5%] right-[25%] w-2 h-2 rounded-full bg-magenta/40 blur-[1px]" />

        {/* Left side particles */}
        <div className="animate-particle-float-1 absolute top-[25%] left-[15%] w-1.5 h-1.5 rounded-full bg-primary/40 blur-[0.5px]" />
        <div className="animate-particle-float-3 absolute top-[40%] left-[10%] w-2 h-2 rounded-full bg-cyan/50 blur-[1px]" />
        <div className="animate-particle-float-2 absolute top-[55%] left-[12%] w-1.5 h-1.5 rounded-full bg-electric-blue/60 blur-[0.5px]" />
        <div className="animate-particle-float-1 absolute top-[35%] left-[18%] w-1 h-1 rounded-full bg-magenta/50 blur-[0.5px]" />

        {/* Right side particles */}
        <div className="animate-particle-float-2 absolute top-[45%] right-[12%] w-2 h-2 rounded-full bg-teal/50 blur-[1px]" />
        <div className="animate-particle-float-3 absolute top-[60%] right-[15%] w-1.5 h-1.5 rounded-full bg-primary/50 blur-[0.5px]" />
        <div className="animate-particle-float-1 absolute top-[50%] right-[20%] w-1 h-1 rounded-full bg-orange/60 blur-[0.5px]" />

        {/* Bottom particles */}
        <div className="animate-particle-float-2 absolute top-[5%] left-[45%] w-2 h-2 rounded-full bg-magenta/40 blur-[1px]" />
        <div className="animate-particle-float-1 absolute bottom-[20%] left-[30%] w-1.5 h-1.5 rounded-full bg-cyan/50 blur-[0.5px]" />
        <div className="animate-particle-float-3 absolute bottom-[25%] right-[35%] w-2 h-2 rounded-full bg-primary/40 blur-[1px]" />
        <div className="animate-particle-float-2 absolute bottom-[15%] left-[40%] w-1 h-1 rounded-full bg-electric-blue/60 blur-[0.5px]" />
        <div className="animate-particle-float-1 absolute bottom-[30%] right-[25%] w-1.5 h-1.5 rounded-full bg-teal/50 blur-[0.5px]" />
      </div>
    </div>
  );
};
