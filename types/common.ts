export type EvidenceKind =
  | "user_provided"
  | "ai_interpretation"
  | "unverified";

export type Evidenced<T> = {
  value: T;
  evidence: EvidenceKind;
  note?: string;
};

export type StudentYear = 1 | 2 | 3 | 4;

export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

export type OpportunityCategory =
  | "internship"
  | "hackathon"
  | "course"
  | "competition"
  | "club"
  | "event"
  | "certification"
  | "other";

export type RiskLevel = "low" | "moderate" | "high" | "unknown";

export type VerificationStatus =
  | "unverified"
  | "community_supported"
  | "flagged"
  | "insufficient_evidence";
