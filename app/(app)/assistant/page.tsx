import { AssistantChat } from "@/components/assistant/assistant-chat";
import { getCurrentUser } from "@/lib/auth/server";
import { getAssistantConversation } from "@/lib/db/assistant";
import { loadAssistantOpportunityContext } from "@/lib/services/assistant";

export const metadata = {
  title: "Assistant",
};

export default async function AssistantPage({
  searchParams,
}: {
  searchParams: Promise<{ opportunityId?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  const conversation = user ? await getAssistantConversation(user.id) : { messages: [] };
  const opportunityContext =
    user && params.opportunityId
      ? await loadAssistantOpportunityContext(user.id, params.opportunityId).catch(() => null)
      : null;

  return (
    <AssistantChat
      initialMessages={conversation.messages}
      opportunityId={params.opportunityId}
      opportunitySummary={
        opportunityContext
          ? {
              title: opportunityContext.opportunity.title,
              organization: opportunityContext.opportunity.organization,
              overallScore: opportunityContext.analysis.overallScore,
              averageRating: opportunityContext.seniorInsights.averageRating,
            }
          : null
      }
    />
  );
}
