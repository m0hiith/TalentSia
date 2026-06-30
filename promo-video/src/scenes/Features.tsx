import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Sequence,
} from "remotion";
import { FileSearch, Target, Briefcase } from "lucide-react";
import { color, radius } from "../theme";
import { FONT } from "../fonts";
import { AtsGauge } from "../components/AtsGauge";

const FEATURES = [
  {
    icon: FileSearch,
    title: "Resume Analysis",
    description: "AI extracts your skills, experience, and qualifications automatically.",
  },
  {
    icon: Target,
    title: "Skill Gap Finder",
    description: "See exactly which skills you need to land your dream role.",
  },
  {
    icon: Briefcase,
    title: "Job Matching",
    description: "Get personalized match scores against real, relevant openings.",
  },
];

const FeatureCard: React.FC<{
  icon: React.ElementType;
  title: string;
  description: string;
  delay: number;
}> = ({ icon: Icon, title, description, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 200, mass: 0.8 } });
  const y = interpolate(s, [0, 1], [60, 0]);
  const opacity = interpolate(frame - delay, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Icon glow pulse keyed slightly after the card lands.
  const iconPop = spring({ frame: frame - delay - 6, fps, config: { damping: 12 } });

  return (
    <div
      style={{
        flex: 1,
        opacity,
        transform: `translateY(${y}px)`,
        padding: 44,
        borderRadius: radius,
        background: "hsl(222,47%,14%,0.7)",
        border: `1px solid ${color.cardBorder}`,
        backdropFilter: "blur(12px)",
        boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
        display: "flex",
        flexDirection: "column",
        gap: 22,
      }}
    >
      <div
        style={{
          width: 92,
          height: 92,
          borderRadius: 20,
          background: "linear-gradient(135deg, hsl(217,91%,53%) 0%, hsl(217,91%,40%) 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 30px hsl(217,91%,53%,0.5)",
          transform: `scale(${interpolate(iconPop, [0, 1], [0.6, 1])})`,
        }}
      >
        <Icon size={48} color="white" strokeWidth={2.2} />
      </div>
      <div style={{ fontSize: 40, fontWeight: 700, color: color.foreground }}>{title}</div>
      <div style={{ fontSize: 26, lineHeight: 1.45, color: color.muted }}>{description}</div>
    </div>
  );
};

export const Features: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headProgress = spring({ frame, fps, config: { damping: 200 } });
  const headY = interpolate(headProgress, [0, 1], [-30, 0]);
  const headOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });

  const exitOpacity = interpolate(frame, [276, 300], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        fontFamily: FONT,
        padding: "0 120px",
        opacity: exitOpacity,
      }}
    >
      <div
        style={{
          fontSize: 64,
          fontWeight: 800,
          color: color.foreground,
          letterSpacing: -1.5,
          marginBottom: 56,
          textAlign: "center",
          transform: `translateY(${headY}px)`,
          opacity: headOpacity,
        }}
      >
        Everything you need to get hired
      </div>

      <div style={{ display: "flex", gap: 36, width: "100%", maxWidth: 1640, alignItems: "stretch" }}>
        {FEATURES.map((f, i) => (
          <FeatureCard key={f.title} {...f} delay={20 + i * 16} />
        ))}
      </div>

      {/* ATS gauge floats in lower-center after the cards settle */}
      <Sequence from={120} layout="none">
        <AtsGaugeRow />
      </Sequence>
    </AbsoluteFill>
  );
};

const AtsGaugeRow: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 200, mass: 0.9 } });
  const opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const y = interpolate(s, [0, 1], [40, 0]);

  return (
    <div
      style={{
        marginTop: 56,
        display: "flex",
        alignItems: "center",
        gap: 36,
        opacity,
        transform: `translateY(${y}px)`,
        padding: "28px 48px",
        borderRadius: radius,
        background: "hsl(222,47%,14%,0.6)",
        border: `1px solid ${color.cardBorder}`,
        backdropFilter: "blur(12px)",
      }}
    >
      <AtsGauge delay={10} target={92} />
      <div style={{ maxWidth: 520 }}>
        <div style={{ fontSize: 34, fontWeight: 700, color: color.foreground, marginBottom: 10 }}>
          Beat the bots.
        </div>
        <div style={{ fontSize: 26, lineHeight: 1.45, color: color.muted }}>
          Instantly score your resume against any job and optimize for the applicant tracking system.
        </div>
      </div>
    </div>
  );
};
