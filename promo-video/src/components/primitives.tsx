import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { gradient } from "../theme";
import { FONT as FONT_FAMILY } from "../fonts";

// Gradient text matching the app's `.text-gradient` utility.
export const GradientText: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <span
    style={{
      backgroundImage: gradient.text,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      WebkitTextFillColor: "transparent",
      ...style,
    }}
  >
    {children}
  </span>
);

// Words rise + fade in, staggered. Used for headlines.
export const RevealWords: React.FC<{
  text: string;
  delay?: number;
  stagger?: number;
  style?: React.CSSProperties;
  wordStyle?: React.CSSProperties;
}> = ({ text, delay = 0, stagger = 4, style, wordStyle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0 0.28em",
        fontFamily: FONT_FAMILY,
        ...style,
      }}
    >
      {words.map((word, i) => {
        const local = frame - delay - i * stagger;
        const s = spring({
          frame: local,
          fps,
          config: { damping: 200, mass: 0.7 },
        });
        const y = interpolate(s, [0, 1], [42, 0]);
        const opacity = interpolate(local, [0, 8], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              transform: `translateY(${y}px)`,
              opacity,
              ...wordStyle,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

// Generic spring-in entrance (scale + rise + fade) for a block of content.
export const useEntrance = (delay = 0, damping = 200) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping, mass: 0.8 },
  });
  return {
    opacity: interpolate(frame - delay, [0, 10], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    scale: interpolate(s, [0, 1], [0.9, 1]),
    y: interpolate(s, [0, 1], [30, 0]),
    progress: s,
  };
};
