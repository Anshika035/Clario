import { mockAiProvider } from "@/lib/ai/mock";
import { openAiProvider } from "@/lib/ai/openai";
import { getAssistantConversation, saveAssistantTurn } from "@/lib/db/assistant";
import { getProfileForUser } from "@/lib/db/profile";
import { getOpportunityAnalysisForUser } from "@/lib/db/opportunities";
import { getOpportunityReviews } from "@/lib/db/reviews";
import type { ChatMessage } from "@/types/ai";
import type { AssistantOpportunityContext } from "@/types/ai";
import type { AssistantConversation } from "@/types/assistant";

const assistantProvider =
  process.env.NODE_ENV === "development" && process.env.AI_PROVIDER === "mock"
    ? mockAiProvider
    : openAiProvider;

export class AssistantServiceError extends Error {
  constructor(
    message: string,
    readonly code: "validation" | "provider" | "database",
  ) {
    super(message);
    this.name = "AssistantServiceError";
  }
}

export async function loadAssistantConversation(userId: string): Promise<AssistantConversation> {
  try {
    return await getAssistantConversation(userId);
  } catch {
    throw new AssistantServiceError("The assistant conversation could not be loaded.", "database");
  }
}

export async function loadAssistantOpportunityContext(
  userId: string,
  opportunityId: string,
): Promise<AssistantOpportunityContext | null> {
  const result = await getOpportunityAnalysisForUser(userId, opportunityId);
  if (!result) {
    return null;
  }

  const reviews = await getOpportunityReviews(opportunityId);
  return {
    opportunity: {
      ...result.opportunity,
      description: result.opportunity.description,
    },
    analysis: result.analysis,
    seniorInsights: {
      reviewCount: reviews.consensus.reviewCount,
      averageRating: reviews.consensus.averageRating,
      reviews: reviews.reviews.slice(0, 5).map((review) => ({
        body: review.body.slice(0, 500),
        rating: review.rating,
        studentYear: review.studentYear,
        branch: review.branch,
      })),
    },
  };
}

export async function answerAssistantQuestion(userId: string, content: string, opportunityId?: string) {
  const trimmedContent = content.trim();
  if (!trimmedContent) {
    throw new AssistantServiceError("Ask a question before sending.", "validation");
  }
  if (trimmedContent.length > 2000) {
    throw new AssistantServiceError("Keep questions under 2,000 characters.", "validation");
  }

  let conversation: AssistantConversation;
  const profile = await getProfileForUser(userId).catch(() => null);
  const opportunityContext = opportunityId
    ? await loadAssistantOpportunityContext(userId, opportunityId).catch(() => null)
    : null;
  try {
    conversation = await getAssistantConversation(userId);
  } catch {
    throw new AssistantServiceError("The assistant conversation could not be loaded.", "database");
  }

  const messages: ChatMessage[] = [
    ...conversation.messages.map(({ role, content: messageContent }) => ({
      role,
      content: messageContent,
    })),
    { role: "user", content: trimmedContent },
  ];

  let answer: string;
  try {
    const result = await assistantProvider.collegeChat({ messages, profile, opportunityContext });
    answer = result.content;
  } catch {
    throw new AssistantServiceError("The assistant could not answer right now.", "provider");
  }

  try {
    return await saveAssistantTurn(userId, trimmedContent, answer);
  } catch {
    throw new AssistantServiceError("The assistant response could not be saved.", "database");
  }
}
