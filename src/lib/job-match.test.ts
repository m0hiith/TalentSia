import { describe, it, expect } from "vitest";
import { calculateJobMatch, type Job } from "./job-match";
import type { ResumeData } from "@/store/resumeStore";

const baseJob: Job = {
  id: "1",
  Title: "Frontend Developer",
  Company: "Acme",
  Location: "Remote",
  Salary: "100k",
  Description: "Build UIs",
  skills: ["React", "TypeScript", "CSS"],
};

const baseResume: ResumeData = {
  skills: ["React", "TypeScript"],
  experience_years: 3,
  education: "BS",
  job_titles: ["Frontend Developer"],
  interests: ["frontend"],
};

describe("calculateJobMatch", () => {
  it("returns 0 when there is no resume", () => {
    expect(calculateJobMatch(baseJob, null)).toBe(0);
  });

  it("scores higher when more skills overlap", () => {
    const partial = calculateJobMatch(baseJob, { ...baseResume, skills: ["React"] });
    const full = calculateJobMatch(baseJob, { ...baseResume, skills: ["React", "TypeScript", "CSS"] });
    expect(full).toBeGreaterThan(partial);
  });

  it("is case-insensitive on skill matching", () => {
    const lower = calculateJobMatch(baseJob, { ...baseResume, skills: ["react", "typescript", "css"] });
    const upper = calculateJobMatch(baseJob, { ...baseResume, skills: ["REACT", "TYPESCRIPT", "CSS"] });
    expect(lower).toBe(upper);
    expect(lower).toBeGreaterThan(0);
  });

  it("stays within [0, 100]", () => {
    const score = calculateJobMatch(baseJob, baseResume);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("does not divide by zero when the job lists no skills", () => {
    const score = calculateJobMatch({ ...baseJob, skills: [] }, baseResume);
    expect(Number.isFinite(score)).toBe(true);
  });

  it("rewards a title that matches the user's interests", () => {
    const withInterest = calculateJobMatch(
      { ...baseJob, Title: "Frontend Engineer" },
      { ...baseResume, interests: ["frontend"], job_titles: [] },
    );
    const withoutInterest = calculateJobMatch(
      { ...baseJob, Title: "Plumber" },
      { ...baseResume, interests: ["frontend"], job_titles: [] },
    );
    expect(withInterest).toBeGreaterThan(withoutInterest);
  });
});
