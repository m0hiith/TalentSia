import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { FileText, PenLine, GraduationCap, BookmarkCheck } from "lucide-react";
import { color, radius } from "../theme";
import { FONT } from "../fonts";

const TOOLS = [
  { icon: FileText, label: "Resume Builder" },
  { icon: PenLine, label: "Cover Letter Generator" },
  { icon: GraduationCap, label: "Learning Paths" },
  { icon: BookmarkCheck, label: "Saved Jobs & Tracking" },
];

const Pill: React.FC<{ icon: React.ElementType; label: string; delay: number }> = ({
  icon: Icon,
  label,
  delay,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 14, mass: 0.7 } });
  const scale = interpolate(s, [0, 1], [0.7, 1]);
  const opacity = interpolate(frame - delay, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        display: "flex",
        alignItems: "center",
        gap: 20,
        padding: "26px 40px",
        borderRadius: radius,
        background: "hsl(222,47%,14%,0.75)",
        border: `1px solid ${color.cardBorder}`,
        backdropFilter: "blur(12px)",
        boxShadow: "0 18px 50px rgba(0,0,0,0.3)",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          background: "linear-gradient(135deg, hsl(217,91%,53%) 0%, hsl(217,91%,40%) 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 22px hsl(217,91%,53%,0.45)",
        }}
      >
        <Icon size={34} color="white" strokeWidth={2.2} />
      </div>
      <span style={{ fontSize: 36, fontWeight: 600, color: color.foreground }}>{label}</span>
    </div>
  );
};

export const Tools: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = spring({ frame, fps, config: { damping: 200 } });
  const headY = interpolate(head, [0, 1], [-26, 0]);
  const headOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const exitOpacity = interpolate(frame, [126, 150], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        fontFamily: FONT,
        opacity: exitOpacity,
      }}
    >
      <div
        style={{
          fontSize: 58,
          fontWeight: 800,
          color: color.foreground,
          letterSpacing: -1.5,
          marginBottom: 60,
          transform: `translateY(${headY}px)`,
          opacity: headOpacity,
        }}
      >
        One platform. Every step of the hunt.
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 30,
          width: "100%",
          maxWidth: 1280,
          justifyItems: "stretch",
        }}
      >
        {TOOLS.map((t, i) => (
          <Pill key={t.label} {...t} delay={16 + i * 12} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
