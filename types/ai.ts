import type { OpportunityInput } from "./opportunity";
import type { Profile } from "./profile";
import type { OpportunityAnalysisResult } from "./analysis";

export type AssistantOpportunityContext = {
  opportunity: {
    title: string;
    organization: string | null;
    description: string;
    category: string;
    url: string | null;
  };
  analysis: OpportunityAnalysisResult;
  seniorInsights: {
    reviewCount: number;
    averageRating: number | null;
    reviews: Array<{
      body: string;
      rating?: number;
      studentYear: number;
      branch: string;
    }>;
  };
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AiProvider = {
  analyzeOpportunity(input: {
    opportunity: OpportunityInput;
    profile: Profile | null;
  }): Promise<OpportunityAnalysisResult>;

  collegeChat(input: {
    messages: ChatMessage[];
    profile: Profile | null;
    opportunityContext?: AssistantOpportunityContext | null;
  }): Promise<{ content: string }>;
};
