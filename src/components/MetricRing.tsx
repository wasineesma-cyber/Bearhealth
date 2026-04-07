"use client";

interface MetricRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  bgColor?: string;
  label: string;
  sublabel?: string;
  unit?: string;
  children?: React.ReactNode;
}

export default function MetricRing({
  value,
  max = 100,
  size = 160,
  strokeWidth = 12,
  color,
  bgColor = "#2a2a2a",
  label,
  sublabel,
  unit = "",
}: MetricRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / max, 1);
  const offset = circumference - pct * circumference;
  const center = size / 2;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={bgColor}
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
          />
          {/* Glow effect */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth * 0.3}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            opacity={0.3}
            style={{
              filter: `blur(4px)`,
              transition: "stroke-dashoffset 1s ease-in-out",
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-bold leading-none"
            style={{
              fontSize: size * 0.22,
              color,
            }}
          >
            {Math.round(value)}
            {unit && (
              <span style={{ fontSize: size * 0.1, opacity: 0.8 }}>{unit}</span>
            )}
          </span>
          <span
            className="text-bear-subtle font-medium mt-1"
            style={{ fontSize: size * 0.09 }}
          >
            {label}
          </span>
        </div>
      </div>
      {sublabel && (
        <span
          className="text-xs font-semibold px-3 py-1 rounded-full"
          style={{
            color,
            backgroundColor: `${color}22`,
          }}
        >
          {sublabel}
        </span>
      )}
    </div>
  );
}
