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
import { color } from "../theme";
import { FONT } from "../fonts";
import { GradientText } from "../components/primitives";

export const LogoReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({ frame, fps, config: { damping: 12, mass: 0.9 } });
  const logoScale = interpolate(pop, [0, 1], [0.4, 1]);
  const logoRotate = interpolate(pop, [0, 1], [-25, 0]);

  // Ring sweep
  const ring = spring({ frame: frame - 4, fps, config: { damping: 200 } });
  const ringScale = interpolate(ring, [0, 1], [0.6, 1.35]);
  const ringOpacity = interpolate(frame, [6, 20, 45], [0, 0.6, 0], {
    extrapolateRight: "clamp",
  });

  const wordmarkProgress = spring({
    frame: frame - 18,
    fps,
    config: { damping: 200, mass: 0.7 },
  });
  const wordmarkY = interpolate(wordmarkProgress, [0, 1], [30, 0]);

  const taglineOpacity = interpolate(frame, [32, 46], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Whole scene gently floats up and out at the end (handed off via transition).
  const exitY = interpolate(frame, [70, 90], [0, -24], {
    extrapolateLeft: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        fontFamily: FONT,
        transform: `translateY(${exitY}px)`,
      }}
    >
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ position: "relative", width: 240, height: 240, marginBottom: 36 }}>
          {/* glow ring */}
          <AbsoluteFill
            style={{
              borderRadius: "50%",
              border: `3px solid ${color.primaryLight}`,
              transform: `scale(${ringScale})`,
              opacity: ringOpacity,
              boxShadow: `0 0 60px hsl(217,91%,53%,0.6)`,
            }}
          />
          {/* soft halo behind logo */}
          <AbsoluteFill
            style={{
              borderRadius: "50%",
              background: "radial-gradient(circle, hsl(217,91%,53%,0.45), transparent 65%)",
              transform: "scale(1.4)",
              filter: "blur(20px)",
            }}
          />
          <Img
            src={staticFile("logo.png")}
            style={{
              width: 240,
              height: 240,
              objectFit: "contain",
              transform: `scale(${logoScale}) rotate(${logoRotate}deg)`,
              filter: "drop-shadow(0 18px 50px hsl(217,91%,53%,0.45))",
            }}
          />
        </div>

        <div style={{ overflow: "hidden" }}>
          <div
            style={{
              transform: `translateY(${wordmarkY}px)`,
              fontSize: 96,
              fontWeight: 800,
              letterSpacing: -2,
              lineHeight: 1,
            }}
          >
            <span style={{ color: color.foreground }}>Talent</span>
            <GradientText>Sia</GradientText>
          </div>
        </div>

        <div
          style={{
            marginTop: 22,
            fontSize: 30,
            fontWeight: 500,
            color: color.muted,
            letterSpacing: 6,
            textTransform: "uppercase",
            opacity: taglineOpacity,
          }}
        >
          AI&nbsp;Career&nbsp;Guidance
        </div>
      </div>
    </AbsoluteFill>
  );
};
