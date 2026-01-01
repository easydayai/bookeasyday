interface RainbowParticlesProps {
  density?: "low" | "medium" | "high";
  className?: string;
}

export const RainbowParticles = ({ density = "medium", className = "" }: RainbowParticlesProps) => {
  const colors = [
    "bg-primary/60",
    "bg-[hsl(var(--electric-blue))]/60",
    "bg-[hsl(var(--cyan))]/60",
    "bg-[hsl(var(--teal))]/60",
    "bg-[hsl(var(--magenta))]/60",
    "bg-[hsl(var(--orange))]/60",
    "bg-[hsl(var(--yellow))]/60",
  ];

  const particleCounts = {
    low: 8,
    medium: 16,
    high: 24,
  };

  const count = particleCounts[density];

  const getRandomPosition = (index: number) => {
    // Distribute particles across the container
    const row = Math.floor(index / 4);
    const col = index % 4;
    const baseTop = 10 + (row * 20) + (Math.random() * 15);
    const baseLeft = 5 + (col * 25) + (Math.random() * 15);
    return { top: `${baseTop}%`, left: `${baseLeft}%` };
  };

  const getSize = (index: number) => {
    const sizes = ["w-1 h-1", "w-1.5 h-1.5", "w-2 h-2", "w-2.5 h-2.5", "w-3 h-3"];
    return sizes[index % sizes.length];
  };

  const getAnimation = (index: number) => {
    const animations = [
      "animate-particle-fast-1",
      "animate-particle-fast-2",
      "animate-particle-fast-3",
      "animate-particle-orbit-1",
      "animate-particle-orbit-2",
    ];
    return animations[index % animations.length];
  };

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {Array.from({ length: count }).map((_, i) => {
        const pos = getRandomPosition(i);
        return (
          <div
            key={i}
            className={`absolute rounded-full ${colors[i % colors.length]} ${getSize(i)} ${getAnimation(i)} blur-[0.5px]`}
            style={{
              top: pos.top,
              left: pos.left,
              animationDelay: `${(i * 0.3) % 3}s`,
            }}
          />
        );
      })}
    </div>
  );
};
