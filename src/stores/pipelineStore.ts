import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Stage = "sourced" | "screening" | "interview" | "offer" | "hired" | "rejected";

export interface PipelineCandidate {
  id: string;
  name: string;
  email?: string;
  skills?: string;
  years_experience?: number;
  seniority?: string;
  location?: string;
  industry?: string;
  stage: Stage;
  notes?: string;
  updatedAt: string;
  fit_score?: number;
}

interface PipelineState {
  candidates: PipelineCandidate[];
  add: (candidate: Omit<PipelineCandidate, "stage" | "updatedAt"> & { stage?: Stage }) => void;
  move: (id: string, newStage: Stage) => void;
  update: (id: string, data: Partial<PipelineCandidate>) => void;
  remove: (id: string) => void;
  getByStage: (stage: Stage) => PipelineCandidate[];
}

export const usePipelineStore = create<PipelineState>()(
  persist(
    (set, get) => ({
      candidates: [], // ✅ always an array

      add: (candidate) => {
        const newCandidate: PipelineCandidate = {
          ...candidate,
          stage: candidate.stage ?? "sourced",
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          candidates: [...state.candidates, newCandidate],
        }));
      },

      move: (id, newStage) => {
        set((state) => ({
          candidates: state.candidates.map((c) =>
            c.id === id ? { ...c, stage: newStage, updatedAt: new Date().toISOString() } : c
          ),
        }));
      },

      update: (id, data) => {
        set((state) => ({
          candidates: state.candidates.map((c) =>
            c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
          ),
        }));
      },

      remove: (id) => {
        set((state) => ({
          candidates: state.candidates.filter((c) => c.id !== id),
        }));
      },

      getByStage: (stage) => {
        return get().candidates.filter((c) => c.stage === stage);
      },
    }),
    { name: "pipeline-storage" }
  )
);