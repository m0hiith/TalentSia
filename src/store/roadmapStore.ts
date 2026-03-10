import { create } from "zustand";
import { persist } from "zustand/middleware";
import { RoadmapModule, ModuleStatus } from "@/lib/roadmap-service";

interface RoadmapStore {
    modules: RoadmapModule[];
    setModules: (modules: RoadmapModule[]) => void;
    toggleFocusArea: (moduleId: string, focusAreaId: string) => void;
    completeModule: (moduleId: string) => void;
    getProgress: () => { percentage: number; completed: number; total: number };
}

export const useRoadmapStore = create<RoadmapStore>()(
    persist(
        (set, get) => ({
            modules: [],

            setModules: (modules) => set({ modules }),

            toggleFocusArea: (moduleId, focusAreaId) =>
                set((state) => ({
                    modules: state.modules.map((mod) => {
                        if (mod.id !== moduleId) return mod;
                        return {
                            ...mod,
                            focusAreas: mod.focusAreas.map((fa) =>
                                fa.id === focusAreaId ? { ...fa, completed: !fa.completed } : fa
                            ),
                        };
                    }),
                })),

            completeModule: (moduleId) =>
                set((state) => {
                    const modules = state.modules.map((mod) => {
                        if (mod.id === moduleId) {
                            return {
                                ...mod,
                                status: "completed" as ModuleStatus,
                                focusAreas: mod.focusAreas.map((fa) => ({ ...fa, completed: true })),
                            };
                        }
                        return mod;
                    });

                    // Unlock the next module after the completed one
                    const completedIdx = modules.findIndex((m) => m.id === moduleId);
                    if (completedIdx >= 0 && completedIdx + 1 < modules.length) {
                        const nextMod = modules[completedIdx + 1];
                        if (nextMod.status === "locked") {
                            modules[completedIdx + 1] = { ...nextMod, status: "active" as ModuleStatus };
                        }
                    }

                    return { modules };
                }),

            getProgress: () => {
                const modules = get().modules;
                if (modules.length === 0) return { percentage: 0, completed: 0, total: 0 };
                const completed = modules.filter((m) => m.status === "completed").length;
                const percentage = Math.round((completed / modules.length) * 100);
                return { percentage, completed, total: modules.length };
            },
        }),
        {
            name: "roadmap-storage",
        }
    )
);
