import { openAiProvider, OPENAI_ANALYSIS_MODEL, AiProviderError } from "@/lib/ai/openai";
import { mockAiProvider } from "@/lib/ai/mock";
import { opportunityAnalysisSchema } from "@/lib/ai/schemas";
import { saveOpportunityAnalysis } from "@/lib/db/opportunities";
import { getProfileForUser } from "@/lib/db/profile";
import { opportunityInputSchema } from "@/lib/validation/opportunity";
import { calculateOverallScore } from "@/lib/utils/scoring";
import type { OpportunityAnalysisResult } from "@/types/analysis";
import type { OpportunityInput } from "@/types/opportunity";

const analyzerProvider =
  process.env.AI_PROVIDER === "mock"
    ? mockAiProvider
    : openAiProvider;

export class AnalysisServiceError extends Error {
  constructor(
    message: string,
    readonly code: "configuration" | "provider" | "validation" | "database",
  ) {
    super(message);
    this.name = "AnalysisServiceError";
  }
}

export async function analyzeAndSaveOpportunity(
  userId: string,
  input: OpportunityInput,
) {
  const parsedInput = opportunityInputSchema.safeParse(input);
  if (!parsedInput.success) {
    throw new AnalysisServiceError("The opportunity details are invalid.", "validation");
  }

  let modelResult: OpportunityAnalysisResult;
  try {
    const profile = await getProfileForUser(userId);
    modelResult = await analyzerProvider.analyzeOpportunity({
      opportunity: parsedInput.data,
      profile,
    });
  } catch (error) {
    if (error instanceof AiProviderError) {
      const code = error.code;
      throw new AnalysisServiceError(
        code === "configuration"
          ? "The analyzer is not configured yet."
          : "The analyzer could not complete this request.",
        code,
      );
    }
    throw new AnalysisServiceError("The analyzer could not complete this request.", "provider");
  }

  const validatedResult = opportunityAnalysisSchema.safeParse(modelResult);
  if (!validatedResult.success) {
    throw new AnalysisServiceError("The analyzer returned an invalid result.", "validation");
  }

  const analysis = {
    ...validatedResult.data,
    overallScore: calculateOverallScore(validatedResult.data, parsedInput.data),
  };

  try {
    const id = await saveOpportunityAnalysis(
      userId,
      parsedInput.data,
      analysis,
      OPENAI_ANALYSIS_MODEL,
    );
    return { id };
  } catch {
    throw new AnalysisServiceError("The analysis could not be saved.", "database");
  }
}
