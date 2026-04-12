export interface EmailTemplate {
  subject: string;
  body:    string;
}

export interface EmailPayload {
  candidate_id:    string;
  candidate_email: string;
  candidate_name:  string;
  subject:         string;
  body:            string;
  scheduled_time?: string;
}

export interface EmailHistoryItem {
  id:              string;
  candidate_id:    string;
  candidate_name:  string;
  candidate_email: string;
  subject:         string;
  status:          "sent" | "scheduled" | "failed";
  sent_at?:        string;
  scheduled_time?: string;
}