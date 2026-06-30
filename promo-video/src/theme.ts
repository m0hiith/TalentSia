// Brand tokens pulled directly from the TalentSia webapp (src/index.css, tailwind.config.ts)

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

// HSL tokens (matching the app's CSS custom properties)
export const color = {
  background: "hsl(222, 47%, 11%)", // deep navy
  backgroundDeep: "hsl(222, 50%, 7%)",
  foreground: "hsl(210, 40%, 98%)",
  primary: "hsl(217, 91%, 53%)", // vivid blue
  primaryDark: "hsl(217, 91%, 40%)",
  primaryLight: "hsl(217, 91%, 68%)",
  secondary: "hsl(217, 33%, 17%)",
  muted: "hsl(215, 20%, 65%)",
  cardBorder: "hsl(217, 33%, 24%)",
  success: "hsl(142, 71%, 45%)",
} as const;

export const gradient = {
  primary: `linear-gradient(135deg, hsl(217, 91%, 53%) 0%, hsl(217, 91%, 40%) 100%)`,
  text: `linear-gradient(135deg, hsl(217, 91%, 68%) 0%, hsl(217, 91%, 88%) 100%)`,
} as const;

export const radius = 24; // 0.75rem * scaled up for 1080p

// Scene timing (frames @ 30fps)
export const scene = {
  logo: { from: 0, duration: 90 },
  hero: { from: 80, duration: 150 },
  features: { from: 220, duration: 300 },
  tools: { from: 510, duration: 150 },
  cta: { from: 650, duration: 160 },
};

export const TOTAL_FRAMES = 810; // 27s
