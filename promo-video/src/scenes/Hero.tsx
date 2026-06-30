import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { color } from "../theme";
import { FONT } from "../fonts";
import { GradientText, RevealWords, useEntrance } from "../components/primitives";

export const Hero: React.FC = () => {
  const frame = useCurrentFrame();
  const sub = useEntrance(30);
  const pill = useEntrance(50, 14);

  const exitOpacity = interpolate(frame, [128, 150], [1, 0], {
    extrapolateLeft: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        fontFamily: FONT,
        textAlign: "center",
        padding: "0 160px",
        opacity: exitOpacity,
      }}
    >
      {/* eyebrow pill */}
      <div
        style={{
          opacity: pill.opacity,
          transform: `scale(${pill.scale})`,
          marginBottom: 38,
          padding: "12px 26px",
          borderRadius: 999,
          border: `1px solid ${color.cardBorder}`,
          background: "hsl(217,33%,17%,0.5)",
          backdropFilter: "blur(8px)",
          color: color.primaryLight,
          fontSize: 24,
          fontWeight: 600,
          letterSpacing: 1,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: color.primaryLight,
            boxShadow: `0 0 14px ${color.primaryLight}`,
          }}
        />
        Powered by AI
      </div>

      <RevealWords
        text="Find Your Perfect Job."
        delay={6}
        stagger={5}
        style={{ fontSize: 132, fontWeight: 800, letterSpacing: -3, lineHeight: 1.02, color: color.foreground }}
      />

      <div
        style={{
          marginTop: 40,
          fontSize: 38,
          lineHeight: 1.4,
          color: color.muted,
          maxWidth: 1180,
          opacity: sub.opacity,
          transform: `translateY(${sub.y}px)`,
        }}
      >
        Upload your resume, discover the skills you need, and{" "}
        <GradientText style={{ fontWeight: 700 }}>match with jobs</GradientText> built for your profile.
      </div>
    </AbsoluteFill>
  );
};
