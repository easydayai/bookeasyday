import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  animationType: number;
}

const colors = [
  "bg-primary/70",
  "bg-[hsl(var(--electric-blue))]/70",
  "bg-[hsl(var(--cyan))]/70",
  "bg-[hsl(var(--teal))]/70",
  "bg-[hsl(var(--magenta))]/70",
  "bg-[hsl(var(--orange))]/70",
  "bg-[hsl(var(--yellow))]/70",
];

const generateParticles = (count: number): Particle[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 0.5 + Math.random() * 1.5, // Small sizes: 0.5-2
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 5,
    duration: 2 + Math.random() * 3, // Faster: 2-5s
    animationType: Math.floor(Math.random() * 5),
  }));
};

export const HeroParticles = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate initial particles
    setParticles(generateParticles(40));

    // Regenerate some particles periodically for variety
    const interval = setInterval(() => {
      setParticles(prev => {
        const updated = [...prev];
        // Randomly update 5-10 particles
        const count = 5 + Math.floor(Math.random() * 5);
        for (let i = 0; i < count; i++) {
          const idx = Math.floor(Math.random() * updated.length);
          updated[idx] = {
            ...updated[idx],
            x: Math.random() * 100,
            y: Math.random() * 100,
            delay: 0,
          };
        }
        return updated;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getAnimationClass = (type: number) => {
    const animations = [
      "animate-particle-appear-1",
      "animate-particle-appear-2",
      "animate-particle-appear-3",
      "animate-particle-appear-4",
      "animate-particle-appear-5",
    ];
    return animations[type % animations.length];
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`absolute rounded-full ${particle.color} ${getAnimationClass(particle.animationType)} blur-[0.5px]`}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size * 4}px`,
            height: `${particle.size * 4}px`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}
    </div>
  );
};
