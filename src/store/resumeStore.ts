import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WorkExperience {
  id: string;
  company: string;
  role: string;
  duration: string;
  description: string;
}

export interface ResumeData {
  // Basic Info
  fullName?: string;
  email?: string;
  phone?: string;

  // Core Data
  skills: string[];
  experience_years: number;
  education: string;
  job_titles: string[];
  workExperience?: WorkExperience[];
  resumeText?: string; // Raw text for job matching

  // Analysis & Preferences
  interests?: string[];
  atsScore?: number;
  matchedSkills?: string[];
  missingSkills?: string[];
  atsSummary?: string;
  atsImprovements?: string[];
}

interface ResumeStore {
  resumeData: ResumeData | null;
  setResumeData: (data: ResumeData) => void;
  updateResumeData: (data: Partial<ResumeData>) => void;
  clearResumeData: () => void;
}

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set) => ({
      resumeData: null,
      setResumeData: (data) => set({ resumeData: data }),
      updateResumeData: (data) =>
        set((state) => ({
          resumeData: state.resumeData
            ? { ...state.resumeData, ...data }
            : (data as ResumeData),
        })),
      clearResumeData: () => set({ resumeData: null }),
    }),
    {
      name: "resume-storage", // name of the item in the storage (must be unique)
    }
  )
);
