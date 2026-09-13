import { createServiceRoleClient } from "@/lib/db/server";
import { areEquivalentOpportunityInputs } from "@/lib/db/opportunity-identity";
import type { SeniorReview } from "@/types/review";
import { opportunityInputSchema } from "@/lib/validation/opportunity";

function getDatabaseClient() {
  const client = createServiceRoleClient();
  if (!client) {
    throw new Error("Database is not configured.");
  }
  return client;
}

function mapReview(review: {
  id: string;
  opportunity_id: string;
  author_id: string;
  student_year: number;
  branch: string;
  experience_duration: string | null;
  body: string;
  rating: number | null;
  created_at: string;
}): SeniorReview {
  return {
    id: review.id,
    opportunityId: review.opportunity_id,
    authorId: review.author_id,
    studentYear: review.student_year as SeniorReview["studentYear"],
    branch: review.branch,
    experienceDuration: review.experience_duration ?? undefined,
    body: review.body,
    rating: review.rating ?? undefined,
    createdAt: review.created_at,
    usefulCount: 0,
    notUsefulCount: 0,
  };
}

export async function getOpportunityReviews(opportunityId: string) {
  const { data, error } = await getDatabaseClient()
    .from("reviews")
    .select("id, opportunity_id, author_id, student_year, branch, experience_duration, body, rating, created_at")
    .eq("opportunity_id", opportunityId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Could not load senior reviews.");
  }

  const reviews = data.map(mapReview);
  const ratings = reviews.flatMap((review) => (review.rating === undefined ? [] : [review.rating]));

  return {
    reviews,
    consensus: {
      reviewCount: reviews.length,
      averageRating:
        ratings.length > 0
          ? Math.round((ratings.reduce((total, rating) => total + rating, 0) / ratings.length) * 10) / 10
          : null,
    },
  };
}

export type ReviewedOpportunity = {
  id: string;
  title: string;
  organization: string | null;
  category: string;
  reviewCount: number;
  averageRating: number | null;
  latestReview: {
    body: string;
    createdAt: string;
    rating?: number;
  };
  hasAnalysis: boolean;
};

export type RecentSeniorReview = {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  organization: string | null;
  body: string;
  rating?: number;
  createdAt: string;
};

export async function getRecentSeniorReviews(): Promise<RecentSeniorReview[]> {
    const client = getDatabaseClient();
    const { data: reviews, error: reviewsError } = await client
      .from("reviews")
      .select("id, opportunity_id, body, rating, created_at")
      .order("created_at", { ascending: false })
      .limit(3);

    if (reviewsError) {
      throw new Error("Could not load recent senior reviews.");
    }
    const opportunityIds = [...new Set((reviews ?? []).map((review) => review.opportunity_id))];
    if (!opportunityIds.length) {
      return [];
    }

    const { data: opportunities, error: opportunitiesError } = await client
      .from("opportunities")
      .select("id, title, parsed_input")
      .in("id", opportunityIds);
    if (opportunitiesError) {
      throw new Error("Could not load recent senior review opportunities.");
    }

    const opportunityById = new Map((opportunities ?? []).map((opportunity) => [opportunity.id, opportunity]));
    return (reviews ?? []).flatMap((review) => {
      const opportunity = opportunityById.get(review.opportunity_id);
      if (!opportunity) {
        return [];
      }
      const parsed = opportunityInputSchema.safeParse(opportunity.parsed_input);
      if (!parsed.success) {
        return [];
      }
      return [{
        id: review.id,
        opportunityId: review.opportunity_id,
        opportunityTitle: opportunity.title ?? parsed.data.title,
        organization: parsed.data.organization ?? null,
        body: review.body,
        rating: review.rating === null ? undefined : Number(review.rating),
        createdAt: review.created_at,
      }];
    });
  }
export async function getReviewedOpportunities(): Promise<ReviewedOpportunity[]> {
  const client = getDatabaseClient();
  const { data: reviewRows, error: reviewsError } = await client
    .from("reviews")
    .select("opportunity_id, body, rating, created_at")
    .order("created_at", { ascending: false });

  if (reviewsError) {
    throw new Error("Could not load senior insights.");
  }

  const opportunityIds = [...new Set((reviewRows ?? []).map((review) => review.opportunity_id))];
  if (!opportunityIds.length) {
    return [];
  }

  const [{ data: opportunities, error: opportunitiesError }, { data: analyses, error: analysesError }] =
    await Promise.all([
      client
        .from("opportunities")
        .select("id, title, parsed_input, category")
        .in("id", opportunityIds),
      client.from("opportunity_analyses").select("opportunity_id").in("opportunity_id", opportunityIds),
    ]);

  if (opportunitiesError || analysesError) {
    throw new Error("Could not load senior insight opportunities.");
  }

  const analyzedIds = new Set((analyses ?? []).map((analysis) => analysis.opportunity_id));
  const reviewsByOpportunity = new Map<string, typeof reviewRows>();
  for (const review of reviewRows ?? []) {
    const current = reviewsByOpportunity.get(review.opportunity_id) ?? [];
    current.push(review);
    reviewsByOpportunity.set(review.opportunity_id, current);
  }

  const validOpportunities = (opportunities ?? []).flatMap((opportunity) => {
    const parsed = opportunityInputSchema.safeParse(opportunity.parsed_input);
    return parsed.success ? [{ opportunity, parsed: parsed.data }] : [];
  });
  const groups: Array<{
    canonical: (typeof validOpportunities)[number];
    opportunityIds: string[];
  }> = [];

  for (const candidate of validOpportunities) {
    const group = groups.find(({ canonical }) =>
      areEquivalentOpportunityInputs(candidate.parsed, canonical.parsed),
    );
    if (!group) {
      groups.push({ canonical: candidate, opportunityIds: [candidate.opportunity.id] });
      continue;
    }
    group.opportunityIds.push(candidate.opportunity.id);
    if (!analyzedIds.has(group.canonical.opportunity.id) && analyzedIds.has(candidate.opportunity.id)) {
      group.canonical = candidate;
    }
  }

  return groups.flatMap(({ canonical, opportunityIds }) => {
    const reviews = opportunityIds
      .flatMap((id) => reviewsByOpportunity.get(id) ?? [])
      .sort((left, right) => right.created_at.localeCompare(left.created_at));
    const latestReview = reviews[0];
    if (!reviews.length || !latestReview) {
      return [];
    }
    const ratings = reviews.flatMap((review) =>
      review.rating === null ? [] : [Number(review.rating)],
    );
    return [{
      id: canonical.opportunity.id,
      title: canonical.opportunity.title ?? canonical.parsed.title,
      organization: canonical.parsed.organization ?? null,
      category: canonical.opportunity.category ?? canonical.parsed.category,
      reviewCount: reviews.length,
      averageRating:
        ratings.length > 0
          ? Math.round((ratings.reduce((total, rating) => total + rating, 0) / ratings.length) * 10) / 10
          : null,
      latestReview: {
        body: latestReview.body,
        createdAt: latestReview.created_at,
        rating: latestReview.rating === null ? undefined : Number(latestReview.rating),
      },
      hasAnalysis: opportunityIds.some((id) => analyzedIds.has(id)),
    }];
  });
}

export async function createOpportunityReview(
  authorId: string,
  input: {
    opportunityId: string;
    body: string;
    studentYear: number;
    branch: string;
    experienceDuration?: string;
    rating?: number;
  },
) {
  const { data, error } = await getDatabaseClient()
    .from("reviews")
    .insert({
      opportunity_id: input.opportunityId,
      author_id: authorId,
      body: input.body,
      student_year: input.studentYear,
      branch: input.branch,
      experience_duration: input.experienceDuration ?? null,
      rating: input.rating ?? null,
    })
    .select("id, opportunity_id, author_id, student_year, branch, experience_duration, body, rating, created_at")
    .single();

  if (error || !data) {
    if (error?.code === "23505") {
      throw new Error("You have already reviewed this opportunity.");
    }
    throw new Error("Could not save your review.");
  }

  return mapReview(data);
}

export async function deleteOpportunityReview(
  authorId: string,
  opportunityId: string,
  reviewId: string,
) {
  const { data, error } = await getDatabaseClient()
    .from("reviews")
    .delete()
    .eq("id", reviewId)
    .eq("opportunity_id", opportunityId)
    .eq("author_id", authorId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error("Could not delete your review.");
  }

  return Boolean(data);
}

export async function updateOpportunityReview(
  authorId: string,
  input: {
    opportunityId: string;
    reviewId: string;
    body: string;
    studentYear: number;
    branch: string;
    experienceDuration?: string;
    rating?: number;
  },
) {
  const { data, error } = await getDatabaseClient()
    .from("reviews")
    .update({
      body: input.body,
      student_year: input.studentYear,
      branch: input.branch,
      experience_duration: input.experienceDuration ?? null,
      rating: input.rating ?? null,
    })
    .eq("id", input.reviewId)
    .eq("opportunity_id", input.opportunityId)
    .eq("author_id", authorId)
    .select("id, opportunity_id, author_id, student_year, branch, experience_duration, body, rating, created_at")
    .maybeSingle();

  if (error) {
    throw new Error("Could not update your review.");
  }
  if (!data) {
    throw new Error("Review not found.");
  }

  return mapReview(data);
}
