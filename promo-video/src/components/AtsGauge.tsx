import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { color } from "../theme";

// Circular ATS score gauge that sweeps and counts up to a target value.
export const AtsGauge: React.FC<{ delay?: number; target?: number }> = ({
  delay = 0,
  target = 92,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sweep = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200, mass: 1.2 },
  });
  const value = Math.round(interpolate(sweep, [0, 1], [0, target]));

  const size = 220;
  const stroke = 18;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const dash = circumference * (value / 100);

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <defs>
          <linearGradient id="ats" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(217,91%,68%)" />
            <stop offset="100%" stopColor="hsl(217,91%,45%)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="hsl(217,33%,20%)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ats)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          style={{ filter: "drop-shadow(0 0 10px hsl(217,91%,53%,0.5))" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 800, color: color.foreground, lineHeight: 1 }}>
          {value}
        </div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: color.muted,
            letterSpacing: 2,
            textTransform: "uppercase",
            marginTop: 6,
          }}
        >
          ATS Score
        </div>
      </div>
    </div>
  );
};
