import abstractHeadImage from "@/assets/abstract-head.png";

export const AbstractHead = () => {
  return (
    <div 
      className="relative w-full flex items-center justify-center"
      style={{ 
        height: "85vh",
        marginTop: "-80px",
        overflow: "visible"
      }}
    >
      {/* Space ripple effect */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="animate-space-ripple absolute w-[1200px] h-[1200px] rounded-full bg-gradient-radial from-primary/8 via-cyan/5 to-transparent blur-3xl" />
        <div className="animate-space-ripple-delayed absolute w-[900px] h-[900px] rounded-full bg-gradient-radial from-magenta/6 via-primary/4 to-transparent blur-2xl" />
      </div>

      {/* Floating particles with rainbow colors */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="animate-particle-float-1 absolute top-[8%] left-[25%] w-3 h-3 rounded-full bg-primary/70 blur-[1px]" />
        <div className="animate-particle-float-2 absolute top-[5%] left-[35%] w-4 h-4 rounded-full bg-cyan/60 blur-[2px]" />
        <div className="animate-particle-float-3 absolute top-[15%] left-[20%] w-2 h-2 rounded-full bg-magenta/70 blur-[1px]" />
        <div className="animate-particle-float-1 absolute top-[3%] left-[50%] w-3 h-3 rounded-full bg-electric-blue/50 blur-[1px]" />
        <div className="animate-particle-float-2 absolute top-[20%] left-[15%] w-2.5 h-2.5 rounded-full bg-orange/60 blur-[1px]" />
        <div className="animate-particle-float-3 absolute top-[10%] right-[20%] w-3 h-3 rounded-full bg-primary/50 blur-[1px]" />
        <div className="animate-particle-float-1 absolute top-[18%] right-[25%] w-2 h-2 rounded-full bg-cyan/70 blur-[1px]" />
      </div>

      {/* Abstract Head Image - HERO SCALE */}
      <div className="relative z-10 flex items-start justify-center w-full h-full">
        <img
          src={abstractHeadImage}
          alt="Easy Day AI - Abstract head representing intelligent automation"
          className="animate-head-breathe"
          style={{ 
            height: "130vh",
            width: "auto",
            maxWidth: "none",
            objectFit: "contain",
            marginTop: "-15vh",
            maskImage: "linear-gradient(to bottom, black 0%, black 75%, transparent 100%), linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 75%, transparent 100%), linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
            maskComposite: "intersect",
            WebkitMaskComposite: "source-in"
          }}
        />
      </div>
    </div>
  );
};
