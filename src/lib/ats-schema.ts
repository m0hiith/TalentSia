import { z } from "zod";

/**
 * Client-side contract for a resume analysis. The Supabase Edge Function
 * validates the model output server-side with an equivalent schema
 * (`supabase/functions/_shared/ats-schema.ts` — keep the two in sync); the
 * client re-validates the response here as defense-in-depth and to derive the
 * `ATSResult` type. Coercion + defaults absorb minor LLM inconsistencies; truly
 * malformed data throws instead of corrupting app state. (P5)
 */
export const atsResultSchema = z.object({
  basicInfo: z.object({
    fullName: z.string().nullish(),
    email: z.string().nullish(),
    skills: z.array(z.string()).default([]),
    experience_years: z.coerce.number().min(0).max(60).default(0),
    education: z.string().default(""),
    job_titles: z.array(z.string()).default([]),
  }),
  score: z.coerce.number().min(0).max(100),
  matchedSkills: z.array(z.string()).default([]),
  missingSkills: z.array(z.string()).default([]),
  recommendedSkills: z.array(z.string()).default([]),
  details: z.object({
    skillScore: z.coerce.number().min(0).max(100).default(0),
    experienceScore: z.coerce.number().min(0).max(100).default(0),
    roleScore: z.coerce.number().min(0).max(100).default(0),
  }),
  summary: z.string(),
  improvements: z.array(z.string()).default([]),
  inferredInterests: z.array(z.string()).default([]),
});

export type ATSResultModel = z.infer<typeof atsResultSchema>;

/** What the client works with: the validated model output plus extracted text. */
export type ATSResult = ATSResultModel & {
  /** The résumé text the analysis ran against (P8). */
  fullText?: string;
};
