export interface WorkExperience {
  job_title?:   string;
  company?:     string;
  start_date?:  string;
  end_date?:    string;
  description?: string;
}

export interface CandidateProfile {
  id:               string;
  name:             string;
  email:            string;
  phone?:           string;
  location?:        string;
  years_experience: number;
  seniority:        string;
  education_level:  string;
  industry?:        string;
  summary?:         string;
  skills:           string[];
  work_experience:  WorkExperience[];
  education:        string[];
  certifications:   string[];
  document?:        string;
  has_file?:        boolean;
  quality_score?:   number;
  quality_label?:   "excellent" | "good" | "fair" | "poor";
  quality_issues?:  string[];
  needs_review?:    boolean;
}

export interface CandidateListItem {
  id:               string;
  name:             string;
  email:            string;
  phone?:           string;
  location?:        string;
  years_experience: number;
  seniority:        string;
  education_level:  string;
  industry?:        string;
  skills:           string;
  skills_preview:   string;
  quality_score:    number;
  quality_label:    "excellent" | "good" | "fair" | "poor";
  quality_issues:   string[];
  needs_review:     boolean;
}

export interface CandidateInsights {
  summary:             string;
  strengths:           string[];
  weaknesses:          string[];
  interview_questions: string[];
}