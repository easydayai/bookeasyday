import abstractHeadImage from "@/assets/abstract-head.png";

export const AbstractHead = () => {
  return (
    <div 
      className="relative w-full flex items-center justify-center overflow-visible"
      style={{ height: "70vh", marginTop: "-12vh" }}
    >
      {/* Space ripple effect */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="animate-space-ripple absolute w-[900px] h-[900px] rounded-full bg-gradient-radial from-primary/8 via-cyan/5 to-transparent blur-3xl" />
        <div className="animate-space-ripple-delayed absolute w-[700px] h-[700px] rounded-full bg-gradient-radial from-magenta/6 via-primary/4 to-transparent blur-2xl" />
      </div>

      {/* Floating particles with rainbow colors */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="animate-particle-float-1 absolute top-[12%] left-[30%] w-2 h-2 rounded-full bg-primary/70 blur-[1px]" />
        <div className="animate-particle-float-2 absolute top-[8%] left-[40%] w-3 h-3 rounded-full bg-cyan/60 blur-[2px]" />
        <div className="animate-particle-float-3 absolute top-[18%] left-[25%] w-1.5 h-1.5 rounded-full bg-magenta/70 blur-[1px]" />
        <div className="animate-particle-float-1 absolute top-[5%] left-[45%] w-2.5 h-2.5 rounded-full bg-electric-blue/50 blur-[1px]" />
        <div className="animate-particle-float-2 absolute top-[22%] left-[20%] w-2 h-2 rounded-full bg-orange/60 blur-[1px]" />
      </div>

      {/* Abstract Head Image */}
      <img
        src={abstractHeadImage}
        alt="Easy Day AI - Abstract head representing intelligent automation"
        className="relative z-10 w-auto animate-head-breathe border-0 outline-none"
        style={{ height: "100%", maxHeight: "580px", border: "none", outline: "none" }}
      />
    </div>
  );
};
