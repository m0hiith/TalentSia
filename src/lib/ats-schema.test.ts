import { describe, it, expect } from "vitest";
import { atsResultSchema } from "./ats-schema";

const validBase = {
  basicInfo: {
    fullName: "Jane Doe",
    email: "jane@example.com",
    skills: ["React", "TypeScript"],
    experience_years: 3,
    education: "BS Computer Science",
    job_titles: ["Frontend Developer"],
  },
  score: 80,
  matchedSkills: ["React"],
  missingSkills: ["Go"],
  recommendedSkills: ["Docker"],
  details: { skillScore: 80, experienceScore: 70, roleScore: 90 },
  summary: "Strong resume.",
  improvements: ["Add metrics to your bullet points"],
  inferredInterests: ["frontend"],
};

describe("atsResultSchema", () => {
  it("parses a fully valid object", () => {
    const result = atsResultSchema.parse(validBase);
    expect(result.score).toBe(80);
    expect(result.basicInfo.skills).toEqual(["React", "TypeScript"]);
  });

  it("coerces string numbers (the model frequently returns strings)", () => {
    const result = atsResultSchema.parse({
      ...validBase,
      score: "80",
      basicInfo: { ...validBase.basicInfo, experience_years: "3" },
      details: { skillScore: "80", experienceScore: "70", roleScore: "90" },
    });
    expect(result.score).toBe(80);
    expect(result.basicInfo.experience_years).toBe(3);
    expect(result.details.skillScore).toBe(80);
  });

  it("repairs missing arrays/strings with defaults", () => {
    const result = atsResultSchema.parse({
      basicInfo: { experience_years: 2 },
      score: 50,
      details: {},
      summary: "ok",
    });
    expect(result.matchedSkills).toEqual([]);
    expect(result.basicInfo.skills).toEqual([]);
    expect(result.basicInfo.education).toBe("");
    expect(result.improvements).toEqual([]);
    expect(result.details.roleScore).toBe(0);
  });

  it("throws when a required field (score) is absent", () => {
    const noScore: Record<string, unknown> = { ...validBase };
    delete noScore.score;
    expect(() => atsResultSchema.parse(noScore)).toThrow();
  });

  it("rejects out-of-range scores", () => {
    expect(() => atsResultSchema.parse({ ...validBase, score: 150 })).toThrow();
    expect(() => atsResultSchema.parse({ ...validBase, score: -5 })).toThrow();
  });

  it("rejects prose / non-object responses", () => {
    expect(() => atsResultSchema.parse("Here is the candidate's analysis...")).toThrow();
  });

  it("rejects wrong-typed fields (skills as a string, not an array)", () => {
    expect(() =>
      atsResultSchema.parse({
        ...validBase,
        basicInfo: { ...validBase.basicInfo, skills: "React, SQL" },
      }),
    ).toThrow();
  });
});
