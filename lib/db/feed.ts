import { createServiceRoleClient } from "@/lib/db/server";
import { areEquivalentOpportunityInputs, normalizeOpportunityIdentityValue } from "@/lib/db/opportunity-identity";
import type { Profile } from "@/types/profile";

type FeedItem = {
  id: string;
  title: string;
  organization: string | null;
  description: string;
  category: string;
  url: string | null;
  relevanceScore: number | null;
  matchReasons: string[];
  analysisScore: number | null;
  hasAnalysis: boolean;
  isOwnedByUser: boolean;
  analysisCreatedAt: string | null;
  reviewCount: number;
  averageRating: number | null;
  createdAt: string;
};

function normalize(value: string) {
  return normalizeOpportunityIdentityValue(value);
}

function terms(value: string) {
  return new Set(normalize(value).split(/\s+/).filter((term) => term.length > 2));
}

function rankOpportunity(
  input: { title: string; organization?: string; description: string; category: string },
  profile: Profile | null,
) {
  const opportunityTerms = terms(
    `${input.title} ${input.organization ?? ""} ${input.description} ${input.category}`,
  );
  const profileGroups = [
    { label: "interests", values: profile?.interests ?? [], weight: 4 },
    { label: "skills", values: profile?.skills ?? [], weight: 4 },
    { label: "goals", values: profile?.goals ?? [], weight: 5 },
    { label: "experience", values: profile?.experienceLevel ? [profile.experienceLevel] : [], weight: 2 },
  ];
  const matches = profileGroups.flatMap((group) =>
    group.values.filter((value) => {
      const valueTerms = terms(value);
      return [...valueTerms].some((term) => opportunityTerms.has(term));
    }).map((value) => ({ value, label: group.label, weight: group.weight })),
  );
  const score = Math.min(100, matches.reduce((total, match) => total + match.weight * 10, 0));
  const matchReasons = matches.slice(0, 3).map((match) => `Matches your ${match.label}: ${match.value}`);

  return { score: matches.length ? score : null, matchReasons };
}

export async function getPersonalizedOpportunityFeed(profile: Profile | null, userId: string): Promise<FeedItem[]> {
  const client = createServiceRoleClient();
  if (!client) {
    throw new Error("Database is not configured.");
  }

  const { data: opportunities, error: opportunitiesError } = await client
    .from("opportunities")
    .select("id, title, parsed_input, category, created_at, created_by")
    .order("created_at", { ascending: false })
    .limit(50);
  if (opportunitiesError) {
    throw new Error("Could not load opportunities.");
  }

  const ids = (opportunities ?? []).map((opportunity) => opportunity.id);
  if (!ids.length) {
    return [];
  }
  const [{ data: analyses, error: analysesError }, { data: reviews, error: reviewsError }] = await Promise.all([
    client
      .from("opportunity_analyses")
      .select("opportunity_id, overall_score, created_at")
      .in("opportunity_id", ids)
      .order("created_at", { ascending: false }),
    client.from("reviews").select("opportunity_id, rating").in("opportunity_id", ids),
  ]);
  if (analysesError || reviewsError) {
    throw new Error("Could not load opportunity context.");
  }

  const latestAnalysis = new Map<string, { score: number | null; createdAt: string }>();
  for (const analysis of analyses ?? []) {
    const opportunity = opportunities?.find((item) => item.id === analysis.opportunity_id);
    if (opportunity?.created_by === userId && !latestAnalysis.has(analysis.opportunity_id)) {
      latestAnalysis.set(analysis.opportunity_id, {
        score: analysis.overall_score,
        createdAt: analysis.created_at,
      });
    }
  }

  const reviewSummary = new Map<string, { count: number; ratings: number[] }>();
  for (const review of reviews ?? []) {
    const current = reviewSummary.get(review.opportunity_id) ?? { count: 0, ratings: [] };
    current.count += 1;
    if (review.rating !== null) {
      current.ratings.push(Number(review.rating));
    }
    reviewSummary.set(review.opportunity_id, current);
  }

  const items = (opportunities ?? [])
    .flatMap((opportunity) => {
      const parsed = opportunity.parsed_input;
      if (
        !parsed ||
        typeof parsed !== "object" ||
        typeof parsed.title !== "string" ||
        typeof parsed.description !== "string" ||
        typeof parsed.category !== "string"
      ) {
        return [];
      }
      const rank = rankOpportunity(parsed, profile);
      const summary = reviewSummary.get(opportunity.id) ?? { count: 0, ratings: [] };
      return [{
        id: opportunity.id,
        title: parsed.title,
        organization: typeof parsed.organization === "string" ? parsed.organization : null,
        description: parsed.description,
        category: parsed.category,
        url: typeof parsed.url === "string" ? parsed.url : null,
        relevanceScore: rank.score,
        matchReasons: rank.matchReasons,
        analysisScore: latestAnalysis.get(opportunity.id)?.score ?? null,
        hasAnalysis: latestAnalysis.has(opportunity.id),
        isOwnedByUser: opportunity.created_by === userId,
        analysisCreatedAt: latestAnalysis.get(opportunity.id)?.createdAt ?? null,
        reviewCount: summary.count,
        averageRating:
          summary.ratings.length > 0
            ? Math.round((summary.ratings.reduce((total, rating) => total + rating, 0) / summary.ratings.length) * 10) / 10
            : null,
        createdAt: opportunity.created_at,
      }];
    })
    ;

  const deduplicated = new Map<string, FeedItem>();
  for (const item of items) {
    const normalizedTitle = normalize(item.title);
    const normalizedCategory = normalize(item.category);
    const normalizedDescription = normalize(item.description);
    const normalizedOrganization = normalize(item.organization ?? "");
    const existingEntry = [...deduplicated.entries()].find(([, candidate]) =>
      areEquivalentOpportunityInputs(
        {
          title: item.title,
          category: item.category,
          description: item.description,
          organization: item.organization ?? undefined,
        },
        {
          title: candidate.title,
          category: candidate.category,
          description: candidate.description,
          organization: candidate.organization ?? undefined,
        },
      ),
    );
    const identity = existingEntry?.[0] ?? `${normalizedTitle}|${normalizedCategory}|${normalizedDescription}|${normalizedOrganization}`;
    const existing = existingEntry?.[1];
    if (!existing) {
      deduplicated.set(identity, item);
      continue;
    }

    const itemIsPreferred =
      (item.isOwnedByUser && !existing.isOwnedByUser) ||
      (item.isOwnedByUser === existing.isOwnedByUser &&
        ((item.analysisCreatedAt ?? "") > (existing.analysisCreatedAt ?? "") ||
        (!existing.analysisCreatedAt && Boolean(item.analysisCreatedAt)) ||
        (item.analysisCreatedAt === existing.analysisCreatedAt && item.reviewCount > existing.reviewCount) ||
        (item.analysisCreatedAt === existing.analysisCreatedAt &&
          item.reviewCount === existing.reviewCount &&
          item.createdAt > existing.createdAt)));
    if (itemIsPreferred) {
      deduplicated.set(identity, item);
    }
  }

  return [...deduplicated.values()].sort(
    (a, b) => (b.relevanceScore ?? -1) - (a.relevanceScore ?? -1),
  );
}
