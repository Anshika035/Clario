import type { OpportunityCategory, VerificationStatus } from "./common";

export type OpportunityInput = {
  title: string;
  description: string;
  organization?: string;
  category: OpportunityCategory;
  url?: string;
};

export type Opportunity = {
  id: string;
  createdBy: string;
  rawText: string;
  parsedInput: OpportunityInput | null;
  title: string | null;
  category: OpportunityCategory | null;
  verificationStatus: VerificationStatus;
  createdAt: string;
};
