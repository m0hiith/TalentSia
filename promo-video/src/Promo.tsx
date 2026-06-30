import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { Background } from "./components/Background";
import { LogoReveal } from "./scenes/LogoReveal";
import { Hero } from "./scenes/Hero";
import { Features } from "./scenes/Features";
import { Tools } from "./scenes/Tools";
import { CTA } from "./scenes/CTA";
import { color } from "./theme";
import { FONT } from "./fonts";

// Scene durations (frames @30fps). Transition overlaps are deducted from total.
const DUR = {
  logo: 90,
  hero: 140,
  features: 300,
  tools: 150,
  cta: 150,
};
const TRANSITION = 16;

export const Promo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: color.background, fontFamily: FONT }}>
      <Background />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={DUR.logo}>
          <LogoReveal />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION })}
        />
        <TransitionSeries.Sequence durationInFrames={DUR.hero}>
          <Hero />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: TRANSITION })}
        />
        <TransitionSeries.Sequence durationInFrames={DUR.features}>
          <Features />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: TRANSITION })}
        />
        <TransitionSeries.Sequence durationInFrames={DUR.tools}>
          <Tools />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION })}
        />
        <TransitionSeries.Sequence durationInFrames={DUR.cta}>
          <CTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};

// Total frames = sum(durations) - sum(transitions overlap)
export const PROMO_DURATION =
  DUR.logo + DUR.hero + DUR.features + DUR.tools + DUR.cta - TRANSITION * 4;
