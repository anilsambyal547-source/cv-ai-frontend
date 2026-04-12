import { apiFetch } from "./api.client";
import type { EmailPayload } from "@/types/email";

export const emailService = {
  send: (payload: EmailPayload) =>
    apiFetch<{ message: string; to?: string }>("/api/email", {
      method: "POST",
      body:   JSON.stringify({
        candidate_id:    payload.candidate_id,
        candidate_email: payload.candidate_email,
        candidate_name:  payload.candidate_name,
        subject:         payload.subject,
        body:            payload.body,
      }),
    }),

  history: () =>
    apiFetch<any[]>("/api/email/history").catch(() => []),
};