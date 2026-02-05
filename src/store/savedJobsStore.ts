import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SavedJob {
    id: string;
    title: string;
    company: string;
    location: string;
    salary: string;
    skills: string[];
    description: string;
    url?: string;
    savedAt: string;
    match?: number;
}

interface SavedJobsStore {
    savedJobs: SavedJob[];
    saveJob: (job: Omit<SavedJob, "savedAt">) => void;
    unsaveJob: (jobId: string) => void;
    isJobSaved: (jobId: string) => boolean;
    clearAllSavedJobs: () => void;
}

export const useSavedJobsStore = create<SavedJobsStore>()(
    persist(
        (set, get) => ({
            savedJobs: [],

            saveJob: (job) => {
                const exists = get().savedJobs.some((j) => j.id === job.id);
                if (!exists) {
                    set((state) => ({
                        savedJobs: [
                            ...state.savedJobs,
                            { ...job, savedAt: new Date().toISOString() },
                        ],
                    }));
                }
            },

            unsaveJob: (jobId) => {
                set((state) => ({
                    savedJobs: state.savedJobs.filter((job) => job.id !== jobId),
                }));
            },

            isJobSaved: (jobId) => {
                return get().savedJobs.some((job) => job.id === jobId);
            },

            clearAllSavedJobs: () => {
                set({ savedJobs: [] });
            },
        }),
        {
            name: "saved-jobs-storage",
        }
    )
);
