import type { Evidenced, OpportunityCategory, RiskLevel } from "./common";
import type { EvidenceKind } from "./common";

export type OpportunityAnalysis = {
  opportunityId: string;
  overallScore: Evidenced<number | null>;
  category: Evidenced<OpportunityCategory>;
  verdict: Evidenced<string>;
  strengths: Evidenced<string>[];
  concerns: Evidenced<string>[];
  skillsGained: Evidenced<string>[];
  experienceValue: Evidenced<string>;
  learningValue: Evidenced<string>;
  relevance: Evidenced<string>;
  riskLevel: Evidenced<RiskLevel>;
  bestSuitedFor: Evidenced<string>;
  missingToVerify: string[];
  extractedFromUser: Record<string, string>;
  limitations: string[];
};

export type OpportunityAnalysisResult = {
  overallScore: number;
  verdict:
    | "strong_opportunity"
    | "worth_considering"
    | "mixed"
    | "low_priority"
    | "insufficient_information";
  summary: string;
  strengths: string[];
  concerns: string[];
  skillsGained: string[];
  learningValue: number;
  experienceValue: number;
  relevanceValue: number;
  effortValue: number;
  credibilitySignals: string[];
  missingInformation: string[];
  bestFor: string[];
  recommendation: string;
  fitForYou: {
    summary: string;
    matches: string[];
    gaps: string[];
    readiness: string;
    tradeoff: string;
    profileLimited: boolean;
  };
  evidence: {
    claim: string;
    kind: EvidenceKind;
  }[];
};
