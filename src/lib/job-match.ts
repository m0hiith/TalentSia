import type { ResumeData } from "@/store/resumeStore";

/** The app's canonical job shape (Supabase rows are mapped to this at fetch). */
export interface Job {
  id: string;
  Title: string;
  Company: string;
  Location: string;
  Salary: string;
  Experience?: string;
  Stipend?: string;
  Link?: string;
  Description: string;
  skills: string[];
  match?: number;
}

/**
 * Weighted job-match score in [0, 100]: 60% skill overlap, 20% experience fit,
 * 20% role/interest fit. Pure (no I/O), so it's unit-testable — previously this
 * lived inline in the Jobs component. (P10/P14)
 */
export function calculateJobMatch(job: Job, resumeData: ResumeData | null): number {
  if (!resumeData) return 0;

  const userSkillsLower = (resumeData.skills ?? []).map((s) => s.toLowerCase());
  const title = job.Title.toLowerCase();

  const jobSkills = (Array.isArray(job.skills) ? job.skills : []).map((s) => s.toLowerCase());
  const matchedSkills = jobSkills.filter((js) =>
    userSkillsLower.some((us) => us.includes(js) || js.includes(us)),
  );
  const skillScore = (matchedSkills.length / Math.max(jobSkills.length, 1)) * 100;
  const weightedSkillScore = skillScore * 0.6;

  const userYears = resumeData.experience_years || 0;
  let experienceScore: number;
  if (title.includes("senior")) {
    experienceScore = userYears >= 5 ? 100 : (userYears / 5) * 100;
  } else if (title.includes("junior") || title.includes("intern")) {
    experienceScore = userYears >= 0 ? 100 : 50;
  } else {
    experienceScore = userYears >= 2 ? 100 : (userYears / 2) * 100;
  }
  const weightedExperienceScore = experienceScore * 0.2;

  let roleScore = 0;
  if (resumeData.interests?.some((i) => title.includes(i.toLowerCase()))) {
    roleScore = 100;
  } else if (resumeData.job_titles?.some((t) => title.includes(t.toLowerCase()))) {
    roleScore = 100;
  }
  const weightedRoleScore = roleScore * 0.2;

  const total = Math.round(weightedSkillScore + weightedExperienceScore + weightedRoleScore);
  return Math.min(100, total);
}
