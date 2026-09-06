export const APPLICATION_STATUSES = [
  "saved",
  "applied",
  "interviewing",
  "offer",
  "accepted",
  "rejected",
  "withdrawn",
  "no_response",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export type Application = {
  id: string;
  user_id?: string;
  company: string;
  role_title: string;
  location: string;
  workplace_type: "remote" | "hybrid" | "onsite";
  job_url: string | null;
  source: string | null;
  status: ApplicationStatus;
  applied_at: string | null;
  next_action_at: string | null;
  salary: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ApplicationEvent = {
  id: string;
  application_id: string;
  from_status: ApplicationStatus | null;
  to_status: ApplicationStatus;
  created_at: string;
};

export type JobEligibility = "eligible" | "review" | "restricted";

export type JobOpening = {
  id: string;
  source: "Remotive" | "Jobicy" | "Adzuna";
  title: string;
  company: string;
  location: string;
  url: string;
  description: string;
  publishedAt: string;
  salary: string | null;
  employmentType: string | null;
  logoUrl: string | null;
  eligibility: JobEligibility;
  eligibilityReason: string;
  score: number;
};

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  saved: "Saved",
  applied: "Applied",
  interviewing: "Interviewing",
  offer: "Offer",
  accepted: "Accepted",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
  no_response: "No response",
};
