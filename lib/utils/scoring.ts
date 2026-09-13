import type { OpportunityAnalysisResult } from "@/types/analysis";
import type { OpportunityInput } from "@/types/opportunity";

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function calculateOverallScore(
  analysis: OpportunityAnalysisResult,
  opportunity: OpportunityInput,
) {
  const clarity = clamp(
    100 -
      analysis.missingInformation.length * 8 -
      (opportunity.description.length < 100 ? 12 : 0),
  );
  const evidence = clamp(
    (analysis.evidence.filter((item) => item.kind === "user_provided").length /
      Math.max(analysis.evidence.length, 1)) *
      100,
  );

  return clamp(
    analysis.learningValue * 0.25 +
      analysis.experienceValue * 0.25 +
      analysis.relevanceValue * 0.2 +
      (100 - analysis.effortValue) * 0.15 +
      clarity * 0.1 +
      evidence * 0.05,
  );
}
