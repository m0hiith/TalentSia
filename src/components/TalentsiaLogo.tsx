interface TalentsiaLogoProps {
  variant?: "icon" | "wordmark" | "full";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: { icon: 28, fontSize: 16, wordFontSize: 18, gap: 6 },
  md: { icon: 40, fontSize: 22, wordFontSize: 24, gap: 8 },
  lg: { icon: 56, fontSize: 32, wordFontSize: 34, gap: 10 },
};

export function TalentsiaLogo({ variant = "full", size = "md", className = "" }: TalentsiaLogoProps) {
  const s = sizes[size];

  const icon = (
    <svg
      width={s.icon}
      height={s.icon}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <rect x="6" y="6" width="88" height="88" rx="22" fill="var(--surface, #ffffff)" stroke="var(--border-color, #e3e8f0)" strokeWidth="3" />
      <text
        x="50"
        y="68"
        fontFamily="Poppins, sans-serif"
        fontWeight="800"
        fontSize="48"
        textAnchor="middle"
        fill="var(--brand, #0A66C2)"
      >
        t<tspan fill="var(--brand-accent, #1287E8)">s</tspan>
      </text>
    </svg>
  );

  const wordmark = (
    <span
      style={{
        fontFamily: "Poppins, sans-serif",
        fontWeight: 700,
        fontSize: s.wordFontSize,
        color: "var(--ink, #0F1B2D)",
        letterSpacing: "-0.02em",
        lineHeight: 1,
      }}
    >
      talent<span style={{ color: "var(--brand, #0A66C2)" }}>sia</span>
    </span>
  );

  if (variant === "icon") return <span className={className}>{icon}</span>;
  if (variant === "wordmark") return <span className={className}>{wordmark}</span>;

  return (
    <span
      className={className}
      style={{ display: "inline-flex", alignItems: "center", gap: s.gap }}
    >
      {icon}
      {wordmark}
    </span>
  );
}

export default TalentsiaLogo;
