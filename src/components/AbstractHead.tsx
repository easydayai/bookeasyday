import abstractHeadImage from "@/assets/abstract-head.png";

export const AbstractHead = () => {
  const particleColors = [
    "bg-primary/60",
    "bg-[hsl(var(--electric-blue))]/60",
    "bg-[hsl(var(--cyan))]/60",
    "bg-[hsl(var(--magenta))]/60",
    "bg-[hsl(var(--orange))]/60",
    "bg-[hsl(var(--yellow))]/60",
    "bg-[hsl(var(--teal))]/60",
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-visible">
      {/* Space ripple effect - larger and more subtle (behind) */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-visible">
        <div className="animate-space-ripple absolute w-[150%] aspect-square rounded-full bg-gradient-radial from-primary/5 via-[hsl(var(--cyan))]/3 to-transparent blur-3xl" />
        <div className="animate-space-ripple-delayed absolute w-[120%] aspect-square rounded-full bg-gradient-radial from-[hsl(var(--magenta))]/4 via-primary/2 to-transparent blur-2xl" />
      </div>

      {/* Abstract Head Image - Hero Scale, no borders (middle) */}
      <img
        src={abstractHeadImage}
        alt="Easy Day AI - Abstract head representing intelligent automation"
        className="animate-head-breathe relative z-10 h-auto object-contain border-0 outline-none"
        style={{
          maxHeight: "95vh",
          minHeight: "70vh",
          width: "auto",
          maxWidth: "100%",
        }}
      />

      {/* Floating particles - dense cloud around the head (in front) */}
      <div className="absolute inset-[-30%] z-20 pointer-events-none overflow-visible">
        {/* Top area particles */}
        <div className="animate-particle-fast-1 absolute top-[5%] left-[20%] w-2 h-2 rounded-full bg-primary/70 blur-[0.5px]" />
        <div className="animate-particle-fast-2 absolute top-[8%] left-[35%] w-3 h-3 rounded-full bg-[hsl(var(--cyan))]/60 blur-[1px]" />
        <div className="animate-particle-orbit-1 absolute top-[3%] left-[50%] w-2.5 h-2.5 rounded-full bg-[hsl(var(--magenta))]/60 blur-[0.5px]" />
        <div className="animate-particle-fast-3 absolute top-[10%] left-[65%] w-2 h-2 rounded-full bg-[hsl(var(--electric-blue))]/60 blur-[1px]" />
        <div className="animate-particle-orbit-2 absolute top-[6%] right-[22%] w-1.5 h-1.5 rounded-full bg-[hsl(var(--orange))]/70 blur-[0.5px]" />
        
        {/* Upper left cluster */}
        <div className="animate-particle-float-1 absolute top-[15%] left-[15%] w-2 h-2 rounded-full bg-primary/60 blur-[0.5px]" />
        <div className="animate-particle-fast-2 absolute top-[12%] left-[25%] w-3 h-3 rounded-full bg-[hsl(var(--cyan))]/50 blur-[1px]" />
        <div className="animate-particle-orbit-1 absolute top-[20%] left-[10%] w-1.5 h-1.5 rounded-full bg-[hsl(var(--magenta))]/60 blur-[0.5px]" />
        <div className="animate-particle-fast-1 absolute top-[18%] left-[30%] w-2 h-2 rounded-full bg-[hsl(var(--yellow))]/60 blur-[0.5px]" />
        
        {/* Upper right cluster */}
        <div className="animate-particle-fast-2 absolute top-[12%] right-[18%] w-2.5 h-2.5 rounded-full bg-[hsl(var(--electric-blue))]/50 blur-[1px]" />
        <div className="animate-particle-orbit-2 absolute top-[18%] right-[12%] w-2 h-2 rounded-full bg-[hsl(var(--orange))]/50 blur-[1px]" />
        <div className="animate-particle-float-3 absolute top-[8%] right-[30%] w-1.5 h-1.5 rounded-full bg-[hsl(var(--cyan))]/60 blur-[0.5px]" />
        <div className="animate-particle-fast-3 absolute top-[22%] right-[25%] w-2 h-2 rounded-full bg-[hsl(var(--teal))]/60 blur-[0.5px]" />
        
        {/* Mid-left particles */}
        <div className="animate-particle-orbit-1 absolute top-[35%] left-[8%] w-2 h-2 rounded-full bg-primary/50 blur-[0.5px]" />
        <div className="animate-particle-fast-1 absolute top-[40%] left-[12%] w-2.5 h-2.5 rounded-full bg-[hsl(var(--magenta))]/50 blur-[1px]" />
        <div className="animate-particle-float-2 absolute top-[45%] left-[5%] w-1.5 h-1.5 rounded-full bg-[hsl(var(--cyan))]/60 blur-[0.5px]" />
        
        {/* Mid-right particles */}
        <div className="animate-particle-fast-2 absolute top-[35%] right-[8%] w-2 h-2 rounded-full bg-[hsl(var(--electric-blue))]/50 blur-[0.5px]" />
        <div className="animate-particle-orbit-2 absolute top-[42%] right-[10%] w-2.5 h-2.5 rounded-full bg-[hsl(var(--yellow))]/50 blur-[1px]" />
        <div className="animate-particle-float-1 absolute top-[48%] right-[6%] w-1.5 h-1.5 rounded-full bg-[hsl(var(--orange))]/60 blur-[0.5px]" />
        
        {/* Bottom area particles */}
        <div className="animate-particle-fast-3 absolute bottom-[20%] left-[20%] w-2 h-2 rounded-full bg-[hsl(var(--teal))]/60 blur-[0.5px]" />
        <div className="animate-particle-orbit-1 absolute bottom-[15%] left-[35%] w-2.5 h-2.5 rounded-full bg-primary/50 blur-[1px]" />
        <div className="animate-particle-float-2 absolute bottom-[25%] left-[15%] w-1.5 h-1.5 rounded-full bg-[hsl(var(--magenta))]/60 blur-[0.5px]" />
        <div className="animate-particle-fast-1 absolute bottom-[18%] right-[30%] w-2 h-2 rounded-full bg-[hsl(var(--cyan))]/60 blur-[0.5px]" />
        <div className="animate-particle-orbit-2 absolute bottom-[22%] right-[18%] w-2.5 h-2.5 rounded-full bg-[hsl(var(--electric-blue))]/50 blur-[1px]" />
        <div className="animate-particle-float-3 absolute bottom-[12%] right-[25%] w-1.5 h-1.5 rounded-full bg-[hsl(var(--orange))]/60 blur-[0.5px]" />
        
        {/* Extra scattered particles for density */}
        <div className="animate-particle-fast-2 absolute top-[28%] left-[18%] w-1 h-1 rounded-full bg-primary/40 blur-[0.5px]" />
        <div className="animate-particle-orbit-1 absolute top-[55%] left-[22%] w-1.5 h-1.5 rounded-full bg-[hsl(var(--yellow))]/50 blur-[0.5px]" />
        <div className="animate-particle-float-1 absolute top-[60%] right-[20%] w-1 h-1 rounded-full bg-[hsl(var(--magenta))]/50 blur-[0.5px]" />
        <div className="animate-particle-fast-3 absolute top-[30%] right-[15%] w-1.5 h-1.5 rounded-full bg-[hsl(var(--teal))]/50 blur-[0.5px]" />
        <div className="animate-particle-orbit-2 absolute top-[50%] left-[8%] w-1 h-1 rounded-full bg-[hsl(var(--cyan))]/60 blur-[0.5px]" />
        <div className="animate-particle-float-3 absolute top-[65%] right-[12%] w-1.5 h-1.5 rounded-full bg-primary/50 blur-[0.5px]" />
      </div>
    </div>
  );
};
