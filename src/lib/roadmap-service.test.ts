import { describe, it, expect } from "vitest";
import { generateRoadmap, inferTargetRole } from "./roadmap-service";

describe("inferTargetRole", () => {
  it("maps known interests to role names", () => {
    expect(inferTargetRole(["frontend"])).toBe("Senior Frontend Engineer");
    expect(inferTargetRole(["data"])).toBe("Data Scientist");
  });

  it("falls back to 'Software Engineer' for unknown or empty interests", () => {
    expect(inferTargetRole(["underwater-basket-weaving"])).toBe("Software Engineer");
    expect(inferTargetRole([])).toBe("Software Engineer");
  });
});

describe("generateRoadmap", () => {
  it("uses the template matching the primary interest", () => {
    const modules = generateRoadmap(["backend"], []);
    expect(modules.length).toBeGreaterThan(0);
    expect(modules[0].title).toBe("Node.js & Express Deep Dive");
  });

  it("falls back to the default template for an unknown interest", () => {
    const modules = generateRoadmap(["unknown-field"], []);
    expect(modules[0].title).toBe("Core Technical Skills");
  });

  it("orders module statuses completed → active → locked", () => {
    const modules = generateRoadmap(["frontend"], []);
    expect(modules[0].status).toBe("completed");
    expect(modules[1].status).toBe("active");
    expect(modules[2].status).toBe("locked");
  });

  it("maps missing skills into focus areas", () => {
    const modules = generateRoadmap(["frontend"], ["React"]);
    const labels = modules.flatMap((m) => m.focusAreas.map((f) => f.label.toLowerCase()));
    expect(labels).toContain("react");
  });
});
