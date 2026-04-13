export interface SearchFilters {
  query:     string;
  skills:    string[];
  minExp:    number | null;
  maxExp:    number | null;
  education: "any" | "bachelor" | "master" | "phd";
  seniority: "any" | "junior" | "mid" | "senior" | "lead" | "principal";
  boolean:   string;
  alpha:     number;
  limit:     number;
}

export interface Candidate {
  id:       string;
  score:    number;
  metadata: {
    name:             string;
    email:            string;
    phone?:           string;
    location?:        string;
    skills:           string;
    years_experience: number;
    education_level:  string;
    seniority:        string;
    industry?:        string;
    summary?:         string;
    stage?:           string;
  };
  fit_breakdown?: {
    semantic:      number;
    skill_overlap: number;
    experience:    number;
    education:     number;
  };
  missing_skills?: string[];
}

export interface SearchResponse {
  results:  Candidate[];
  total:    number;
  query:    string;
  time_ms:  number;
}