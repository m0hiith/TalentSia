import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ApplicationStatus = "applied" | "interview" | "offer" | "rejected";

export interface JobApplication {
    id: string;
    jobId: string;
    title: string;
    company: string;
    location: string;
    salary: string;
    status: ApplicationStatus;
    appliedAt: string;
    updatedAt: string;
    notes: string;
    url?: string;
}

interface ApplicationsStore {
    applications: JobApplication[];
    addApplication: (application: Omit<JobApplication, "id" | "appliedAt" | "updatedAt">) => void;
    updateApplicationStatus: (id: string, status: ApplicationStatus) => void;
    updateApplicationNotes: (id: string, notes: string) => void;
    removeApplication: (id: string) => void;
    getApplicationByJobId: (jobId: string) => JobApplication | undefined;
    clearAllApplications: () => void;
}

export const useApplicationsStore = create<ApplicationsStore>()(
    persist(
        (set, get) => ({
            applications: [],

            addApplication: (application) => {
                const id = `app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                const now = new Date().toISOString();
                set((state) => ({
                    applications: [
                        ...state.applications,
                        {
                            ...application,
                            id,
                            appliedAt: now,
                            updatedAt: now,
                        },
                    ],
                }));
            },

            updateApplicationStatus: (id, status) => {
                set((state) => ({
                    applications: state.applications.map((app) =>
                        app.id === id
                            ? { ...app, status, updatedAt: new Date().toISOString() }
                            : app
                    ),
                }));
            },

            updateApplicationNotes: (id, notes) => {
                set((state) => ({
                    applications: state.applications.map((app) =>
                        app.id === id
                            ? { ...app, notes, updatedAt: new Date().toISOString() }
                            : app
                    ),
                }));
            },

            removeApplication: (id) => {
                set((state) => ({
                    applications: state.applications.filter((app) => app.id !== id),
                }));
            },

            getApplicationByJobId: (jobId) => {
                return get().applications.find((app) => app.jobId === jobId);
            },

            clearAllApplications: () => {
                set({ applications: [] });
            },
        }),
        {
            name: "applications-storage",
        }
    )
);
