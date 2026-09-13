import { z } from "zod";

const boundedText = (max: number) => z.string().trim().min(1).max(max);
const boundedList = (maxItems: number, maxText: number) =>
  z.array(boundedText(maxText)).max(maxItems);

export const opportunityAnalysisSchema = z.object({
  overallScore: z.number().min(0).max(100),
  verdict: z.enum([
    "strong_opportunity",
    "worth_considering",
    "mixed",
    "low_priority",
    "insufficient_information",
  ]),
  summary: boundedText(800),
  strengths: boundedList(6, 300),
  concerns: boundedList(6, 300),
  skillsGained: boundedList(8, 160),
  learningValue: z.number().min(0).max(100),
  experienceValue: z.number().min(0).max(100),
  relevanceValue: z.number().min(0).max(100),
  effortValue: z.number().min(0).max(100),
  credibilitySignals: boundedList(6, 240),
  missingInformation: boundedList(8, 240),
  bestFor: boundedList(6, 160),
  recommendation: boundedText(800),
  fitForYou: z.object({
    summary: boundedText(500),
    matches: boundedList(4, 220),
    gaps: boundedList(4, 220),
    readiness: boundedText(240),
    tradeoff: boundedText(300),
    profileLimited: z.boolean(),
  }),
  evidence: z
    .array(
      z.object({
        claim: boundedText(300),
        kind: z.enum(["user_provided", "ai_interpretation", "unverified"]),
      }),
    )
    .max(12),
});

export const opportunityAnalysisJsonSchema = z.toJSONSchema(opportunityAnalysisSchema, {
  target: "draft-07",
});

export type OpportunityAnalysisResult = z.infer<typeof opportunityAnalysisSchema>;
