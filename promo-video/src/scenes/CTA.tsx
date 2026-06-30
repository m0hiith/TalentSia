import React from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { ArrowRight } from "lucide-react";
import { color } from "../theme";
import { FONT } from "../fonts";
import { GradientText, useEntrance } from "../components/primitives";

export const CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logo = spring({ frame, fps, config: { damping: 14, mass: 0.8 } });
  const logoScale = interpolate(logo, [0, 1], [0.5, 1]);

  const headline = useEntrance(14);
  const button = useEntrance(34, 14);
  const url = useEntrance(50);

  // Button glow pulse (mirrors the app's `animate-glow`).
  const glow = interpolate(Math.sin((frame - 34) / 8), [-1, 1], [0.25, 0.55]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        fontFamily: FONT,
        textAlign: "center",
      }}
    >
      <Img
        src={staticFile("logo.png")}
        style={{
          width: 130,
          height: 130,
          objectFit: "contain",
          marginBottom: 30,
          transform: `scale(${logoScale})`,
          filter: "drop-shadow(0 14px 40px hsl(217,91%,53%,0.45))",
        }}
      />

      <div
        style={{
          fontSize: 96,
          fontWeight: 800,
          letterSpacing: -2.5,
          lineHeight: 1.05,
          color: color.foreground,
          opacity: headline.opacity,
          transform: `translateY(${headline.y}px) scale(${headline.scale})`,
        }}
      >
        Accelerate your <GradientText>career</GradientText> today.
      </div>

      <div
        style={{
          marginTop: 52,
          opacity: button.opacity,
          transform: `scale(${button.scale})`,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 16,
            padding: "28px 56px",
            borderRadius: 18,
            background: "linear-gradient(135deg, hsl(217,91%,53%) 0%, hsl(217,91%,40%) 100%)",
            color: "white",
            fontSize: 38,
            fontWeight: 700,
            boxShadow: `0 0 ${interpolate(glow, [0.25, 0.55], [30, 60])}px hsl(217,91%,53%,${glow})`,
          }}
        >
          Get Started — Free
          <ArrowRight size={40} color="white" strokeWidth={2.6} />
        </div>
      </div>

      <div
        style={{
          marginTop: 46,
          fontSize: 32,
          fontWeight: 600,
          letterSpacing: 4,
          color: color.muted,
          opacity: url.opacity,
        }}
      >
        talentsia.com
      </div>
    </AbsoluteFill>
  );
};
