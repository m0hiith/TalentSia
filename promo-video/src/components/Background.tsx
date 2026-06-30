import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { color } from "../theme";

// Persistent animated backdrop shared across all scenes.
// Deep navy base + drifting radial glow + subtle grain, matching the app's
// `gradient-hero` radial and `animate-shimmer` feel.
export const Background: React.FC = () => {
  const frame = useCurrentFrame();

  // Slow drift of the primary glow so the frame never feels static.
  const driftX = interpolate(
    Math.sin(frame / 120),
    [-1, 1],
    [38, 62],
  );
  const driftY = interpolate(
    Math.cos(frame / 90),
    [-1, 1],
    [-25, 15],
  );

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${color.background} 0%, ${color.backgroundDeep} 100%)`,
      }}
    >
      {/* Primary radial glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 55% at ${driftX}% ${driftY}%, hsl(217, 91%, 53%, 0.32), transparent 60%)`,
        }}
      />
      {/* Secondary cool glow bottom-right for depth */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 50% 45% at 85% 110%, hsl(217, 91%, 60%, 0.14), transparent 55%)`,
        }}
      />
      {/* Vignette to seat content */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 90% 90% at 50% 50%, transparent 55%, rgba(0,0,0,0.45) 100%)",
        }}
      />
      {/* Fine grain texture */}
      <AbsoluteFill
        style={{
          opacity: 0.05,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E\")",
          mixBlendMode: "overlay",
        }}
      />
    </AbsoluteFill>
  );
};
