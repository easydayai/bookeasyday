const LogoInsignia = ({ className = "" }: { className?: string }) => {
  const lines = 24;
  const colors = [
    "#ff3b3b", "#ff6b35", "#ff9500", "#ffc700", "#c8e600",
    "#7ed321", "#00d4aa", "#00bcd4", "#00a8ff", "#4a90d9",
    "#7b68ee", "#9b59b6", "#c471ed", "#e056fd", "#f368e0",
    "#ff6b9d", "#ff8a80", "#ff6b35", "#ff9500", "#ffc700",
    "#7ed321", "#00d4aa", "#4a90d9", "#9b59b6"
  ];

  const generatePath = (index: number) => {
    const angle = (index / lines) * Math.PI * 2;
    const spiralOffset = index * 0.15;
    
    // Start from center
    const startX = 50;
    const startY = 50;
    
    // End point with spiral curve
    const radius = 35;
    const endAngle = angle + spiralOffset;
    const endX = 50 + Math.cos(endAngle) * radius;
    const endY = 50 + Math.sin(endAngle) * radius;
    
    // Control point for curve
    const controlRadius = radius * 0.6;
    const controlAngle = angle + spiralOffset * 0.5;
    const controlX = 50 + Math.cos(controlAngle) * controlRadius;
    const controlY = 50 + Math.sin(controlAngle) * controlRadius;
    
    return {
      path: `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`,
      endX,
      endY,
      color: colors[index % colors.length]
    };
  };

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      style={{ width: '32px', height: '32px' }}
    >
      {Array.from({ length: lines }).map((_, i) => {
        const { path, endX, endY, color } = generatePath(i);
        return (
          <g key={i}>
            <path
              d={path}
              fill="none"
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle
              cx={endX}
              cy={endY}
              r="2.5"
              fill={color}
            />
          </g>
        );
      })}
    </svg>
  );
};

export default LogoInsignia;
