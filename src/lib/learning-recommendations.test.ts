import { describe, it, expect } from "vitest";
import { getResourcesForSkill, getBestFreeResource } from "./learning-recommendations";

describe("getResourcesForSkill", () => {
  it("returns curated resources for a known skill", () => {
    const resources = getResourcesForSkill("React");
    expect(resources.length).toBeGreaterThan(0);
    expect(resources.some((r) => r.title.includes("React"))).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(getResourcesForSkill("REACT")).toEqual(getResourcesForSkill("react"));
  });

  it("falls back to search links for an unknown skill, with a free/paid split", () => {
    const resources = getResourcesForSkill("Underwater Basket Weaving");
    expect(resources).toHaveLength(2);
    expect(resources[0].url).toContain("youtube.com");
    expect(resources.some((r) => r.free)).toBe(true);
    expect(resources.some((r) => !r.free)).toBe(true);
  });
});

describe("getBestFreeResource", () => {
  it("returns a free resource for a known skill", () => {
    const resource = getBestFreeResource("python");
    expect(resource).not.toBeNull();
    expect(resource?.free).toBe(true);
  });
});
