import { createServiceRoleClient } from "@/lib/db/server";
import { opportunityAnalysisSchema } from "@/lib/ai/schemas";
import type { OpportunityAnalysisResult } from "@/types/analysis";
import type { OpportunityInput } from "@/types/opportunity";
import { opportunityInputSchema } from "@/lib/validation/opportunity";

type StoredAnalysis = {
  opportunity: {
    id: string;
    title: string;
    description: string;
    organization: string | null;
    category: string;
    url: string | null;
  };
  analysis: OpportunityAnalysisResult;
};

export type RecentAnalyzedOpportunity = {
  id: string;
  title: string;
  organization: string | null;
  score: number | null;
  analyzedAt: string;
};

export async function getOpportunityInputForPrefill(opportunityId: string): Promise<OpportunityInput | null> {
  const client = getDatabaseClient();
  const { data, error } = await client
    .from("opportunities")
    .select("parsed_input")
    .eq("id", opportunityId)
    .maybeSingle();

  if (error) {
    throw new Error("Could not load the opportunity.");
  }

  const parsed = opportunityInputSchema.safeParse(data?.parsed_input);
  return parsed.success ? parsed.data : null;
}

function getDatabaseClient() {
  const client = createServiceRoleClient();
  if (!client) {
    throw new Error("Database is not configured.");
  }
  return client;
}

function normalizeIdentityValue(value: string | undefined) {
  return value?.trim().replace(/\s+/g, " ").toLowerCase() ?? "";
}

function getOpportunityIdentity(input: OpportunityInput) {
  return JSON.stringify({
    title: normalizeIdentityValue(input.title),
    description: normalizeIdentityValue(input.description),
    organization: normalizeIdentityValue(input.organization),
    category: input.category,
    url: normalizeIdentityValue(input.url).replace(/\/$/, ""),
  });
}

export async function saveOpportunityAnalysis(
  userId: string,
  input: OpportunityInput,
  analysis: OpportunityAnalysisResult,
  model: string,
) {
  const client = getDatabaseClient();
  const rawText = `${input.title}\n\n${input.description}`;

  const { data: existingOpportunities, error: existingError } = await client
    .from("opportunities")
    .select("id, parsed_input")
    .eq("created_by", userId);

  if (existingError) {
    throw new Error("Could not find the opportunity.");
  }

  const identity = getOpportunityIdentity(input);
  const existingOpportunity = existingOpportunities.find((candidate) => {
    const parsed = opportunityInputSchema.safeParse(candidate.parsed_input);
    return parsed.success && getOpportunityIdentity(parsed.data) === identity;
  });

  let opportunityId = existingOpportunity?.id;
  let createdOpportunity = false;
  let opportunityError: { message?: string } | null = null;

  if (!opportunityId) {
    const inserted = await client
      .from("opportunities")
      .insert({
        created_by: userId,
        raw_text: rawText,
        parsed_input: input,
        title: input.title,
        category: input.category,
        verification_status: "unverified",
      })
      .select("id")
      .single();
    opportunityId = inserted.data?.id;
    opportunityError = inserted.error;
    createdOpportunity = Boolean(opportunityId);
  }

  if (opportunityError || !opportunityId) {
    throw new Error("Could not save the opportunity.");
  }

  const { error: analysisError } = await client.from("opportunity_analyses").insert({
    opportunity_id: opportunityId,
    schema_version: 1,
    model,
    overall_score: analysis.overallScore,
    result: analysis,
  });

  if (analysisError) {
    if (createdOpportunity) {
      await client.from("opportunities").delete().eq("id", opportunityId).eq("created_by", userId);
    }
    throw new Error("Could not save the analysis.");
  }

  return opportunityId;
}

export async function getOpportunityAnalysisForUser(userId: string, opportunityId: string) {
  const client = getDatabaseClient();
  const { data: opportunity, error: opportunityError } = await client
    .from("opportunities")
    .select("id, title, parsed_input, category")
    .eq("id", opportunityId)
    .eq("created_by", userId)
    .maybeSingle();

  if (opportunityError || !opportunity) {
    return null;
  }

  const { data: analysis, error: analysisError } = await client
    .from("opportunity_analyses")
    .select("result")
    .eq("opportunity_id", opportunityId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (analysisError || !analysis) {
    return null;
  }

  const parsedInput = opportunityInputSchema.safeParse(opportunity.parsed_input);
  const rawAnalysis =
    analysis.result && typeof analysis.result === "object" && !("fitForYou" in analysis.result)
      ? {
          ...analysis.result,
          fitForYou: {
            summary: "Personalization is limited because this analysis was created before profile-fit details were added.",
            matches: ["Review your profile against the opportunity details directly."],
            gaps: ["This older analysis does not contain a personalized fit assessment."],
            readiness: "Your readiness was not assessed in this older analysis.",
            tradeoff: "Compare the learning and experience value with the effort and requirements you can confirm.",
            profileLimited: true,
          },
        }

      : analysis.result;
  const result = opportunityAnalysisSchema.safeParse(rawAnalysis);
  if (!result.success || !parsedInput.success) {
    return null;
  }

  return {
    opportunity: {
      id: opportunity.id,
      title: opportunity.title ?? "Untitled opportunity",
      description: parsedInput.data.description,
      organization: parsedInput.data.organization ?? null,
      category: opportunity.category ?? "other",
      url: parsedInput.data.url ?? null,
    },
    analysis: result.data,
  } satisfies StoredAnalysis;
}

export async function getRecentAnalyzedOpportunities(
  userId: string,
): Promise<RecentAnalyzedOpportunity[]> {
  const client = getDatabaseClient();
  const { data: opportunities, error: opportunitiesError } = await client
    .from("opportunities")
    .select("id, title, parsed_input")
    .eq("created_by", userId);
  if (opportunitiesError) {
    throw new Error("Could not load recent opportunities.");
  }
  const ids = (opportunities ?? []).map((opportunity) => opportunity.id);
  if (!ids.length) {
    return [];
  }
  const { data: analyses, error: analysesError } = await client
    .from("opportunity_analyses")
    .select("opportunity_id, overall_score, created_at")
    .in("opportunity_id", ids)
    .order("created_at", { ascending: false });
  if (analysesError) {
    throw new Error("Could not load recent analyses.");
  }
  const opportunityById = new Map((opportunities ?? []).map((opportunity) => [opportunity.id, opportunity]));
  const recentByOpportunityId = new Map<string, RecentAnalyzedOpportunity>();
  for (const analysis of analyses ?? []) {
    if (recentByOpportunityId.has(analysis.opportunity_id)) {
      continue;
    }
    const opportunity = opportunityById.get(analysis.opportunity_id);
    if (!opportunity) {
      continue;
    }
    const parsed = opportunityInputSchema.safeParse(opportunity.parsed_input);
    if (!parsed.success) {
      continue;
    }
    recentByOpportunityId.set(analysis.opportunity_id, {
      id: opportunity.id,
      title: opportunity.title ?? parsed.data.title,
      organization: parsed.data.organization ?? null,
      score: analysis.overall_score,
      analyzedAt: analysis.created_at,
    });
  }

  return [...recentByOpportunityId.values()].slice(0, 3);
}
