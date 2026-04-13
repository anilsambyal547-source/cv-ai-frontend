import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ShortlistedCandidate {
  id:               string;
  name:             string;
  email:            string;
  skills:           string;
  years_experience: number;
  seniority?:       string;
  location?:        string;
  industry?:        string;
  stage?:           string;
  addedAt:          string;
}

interface ShortlistState {
  candidates:  ShortlistedCandidate[];
  add:         (c: ShortlistedCandidate) => void;
  remove:      (id: string) => void;
  clear:       () => void;
  has:         (id: string) => boolean;
}

export const useShortlistStore = create<ShortlistState>()(
  persist(
    (set, get) => ({
      candidates: [],

      add: (c) => {
        if (get().has(c.id)) return;
        set((s) => ({ candidates: [...s.candidates, { ...c, addedAt: new Date().toISOString() }] }));
      },

      remove: (id) =>
        set((s) => ({ candidates: s.candidates.filter((c) => c.id !== id) })),

      clear: () => set({ candidates: [] }),

      has: (id) => get().candidates.some((c) => c.id === id),
    }),
    { name: "cv-ai-shortlist" }
  )
);