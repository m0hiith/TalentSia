// Server-side validation schema. Keep in sync with src/lib/ats-schema.ts.
import { z } from "npm:zod@3.25.76";

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
