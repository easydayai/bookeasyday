import abstractHeadImage from "@/assets/abstract-head.png";

export const AbstractHead = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Space ripple effect */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="animate-space-ripple absolute w-[120%] aspect-square rounded-full bg-gradient-radial from-primary/8 via-cyan/5 to-transparent blur-3xl" />
        <div className="animate-space-ripple-delayed absolute w-[90%] aspect-square rounded-full bg-gradient-radial from-magenta/6 via-primary/4 to-transparent blur-2xl" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-visible">
        <div className="animate-particle-float-1 absolute top-[10%] left-[20%] w-3 h-3 rounded-full bg-primary/70 blur-[1px]" />
        <div className="animate-particle-float-2 absolute top-[5%] left-[35%] w-4 h-4 rounded-full bg-cyan/60 blur-[2px]" />
        <div className="animate-particle-float-3 absolute top-[15%] left-[15%] w-2 h-2 rounded-full bg-magenta/70 blur-[1px]" />
        <div className="animate-particle-float-1 absolute top-[8%] right-[30%] w-3 h-3 rounded-full bg-electric-blue/50 blur-[1px]" />
        <div className="animate-particle-float-2 absolute top-[20%] right-[20%] w-2.5 h-2.5 rounded-full bg-orange/60 blur-[1px]" />
      </div>

      {/* Abstract Head Image - Hero Scale */}
      <img
        src={abstractHeadImage}
        alt="Easy Day AI - Abstract head representing intelligent automation"
        className="animate-head-breathe relative z-10 w-full h-auto object-contain"
        style={{ maxHeight: "95vh", minHeight: "70vh" }}
      />
    </div>
  );
};
