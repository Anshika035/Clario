import { AnalyzeForm } from "@/components/opportunity/analyze-form";
import { getOpportunityInputForPrefill } from "@/lib/db/opportunities";

export default async function AnalyzePage({
  searchParams,
}: {
  searchParams: Promise<{ opportunityId?: string }>;
}) {
  const { opportunityId } = await searchParams;
  const initialInput = opportunityId ? await getOpportunityInputForPrefill(opportunityId) : null;

  return <AnalyzeForm initialInput={initialInput} />;
}
