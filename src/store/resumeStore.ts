import { create } from "zustand";

interface ResumeData {
  skills: string[];
  experience_years: number;
  education: string;
  job_titles: string[];
}

interface ResumeStore {
  resumeData: ResumeData | null;
  setResumeData: (data: ResumeData) => void;
  clearResumeData: () => void;
}

export const useResumeStore = create<ResumeStore>((set) => ({
  resumeData: null,
  setResumeData: (data) => set({ resumeData: data }),
  clearResumeData: () => set({ resumeData: null }),
}));
