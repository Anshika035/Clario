import type { VerificationStatus } from "./common";

export type TrustSnapshot = {
  aiScore: number | null;
  seniorConsensus: number | null;
  reviewCount: number;
  verificationStatus: VerificationStatus;
  freshness: "fresh" | "aging" | "stale";
  disclaimer: string;
};
