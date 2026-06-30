import { describe, it, expect, beforeEach } from "vitest";
import { useApplicationsStore } from "./applicationsStore";

const sample = {
  jobId: "job-1",
  title: "Frontend Developer",
  company: "Acme",
  location: "Remote",
  salary: "100k",
  status: "applied" as const,
  notes: "",
  url: "",
};

describe("applicationsStore", () => {
  beforeEach(() => {
    useApplicationsStore.getState().clearAllApplications();
  });

  it("adds an application with a generated id and timestamps", () => {
    useApplicationsStore.getState().addApplication(sample);
    const apps = useApplicationsStore.getState().applications;
    expect(apps).toHaveLength(1);
    expect(apps[0].id).toBeTruthy();
    expect(apps[0].appliedAt).toBeTruthy();
    expect(apps[0].jobId).toBe("job-1");
  });

  it("updates status and notes by id", () => {
    const store = useApplicationsStore.getState();
    store.addApplication(sample);
    const id = useApplicationsStore.getState().applications[0].id;
    store.updateApplicationStatus(id, "interview");
    store.updateApplicationNotes(id, "Phone screen booked");
    const updated = useApplicationsStore.getState().applications[0];
    expect(updated.status).toBe("interview");
    expect(updated.notes).toBe("Phone screen booked");
  });

  it("finds an application by jobId", () => {
    useApplicationsStore.getState().addApplication(sample);
    expect(useApplicationsStore.getState().getApplicationByJobId("job-1")).toBeDefined();
    expect(useApplicationsStore.getState().getApplicationByJobId("missing")).toBeUndefined();
  });

  it("removes an application by id", () => {
    const store = useApplicationsStore.getState();
    store.addApplication(sample);
    const id = useApplicationsStore.getState().applications[0].id;
    store.removeApplication(id);
    expect(useApplicationsStore.getState().applications).toHaveLength(0);
  });
});
