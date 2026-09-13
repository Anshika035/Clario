export const dynamic = "force-dynamic";
import Link from "next/link";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/server";
import { getOpportunityAnalysisForUser } from "@/lib/db/opportunities";
import { getReviewedOpportunities } from "@/lib/db/reviews";

export const metadata = {
  title: "Senior Insights",
};

type SortMode = "reviewed" | "rated" | "recent";

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const opportunities = await getReviewedOpportunities();
  const user = await getCurrentUser();
  const ownedAnalysisIds = new Set(
    user
      ? (await Promise.all(opportunities.map((opportunity) => getOpportunityAnalysisForUser(user.id, opportunity.id)))).flatMap(
          (result) => (result ? [result.opportunity.id] : []),
        )
      : [],
  );
  const requestedSort = (await searchParams).sort;
  const sort: SortMode =
    requestedSort === "rated" || requestedSort === "recent" ? requestedSort : "reviewed";
  const sortedOpportunities = [...opportunities].sort((left, right) => {
    if (sort === "rated") {
      return (right.averageRating ?? -1) - (left.averageRating ?? -1) || right.reviewCount - left.reviewCount;
    }
    if (sort === "recent") {
      return right.latestReview.createdAt.localeCompare(left.latestReview.createdAt);
    }
    return right.reviewCount - left.reviewCount || right.latestReview.createdAt.localeCompare(left.latestReview.createdAt);
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">Community experiences</p>
        <h1 className="mt-2 font-display text-4xl">Senior Insights</h1>
        <p className="mt-3 max-w-2xl text-ink-muted">
          See real student experiences and community opinions before you decide where to spend your time.
        </p>
      </div>

      <Card className="border-accent/20 bg-accent-soft/30">
        <p className="font-medium text-ink">Senior Insights are personal experiences and opinions, not guarantees.</p>
        <p className="mt-1 text-sm text-ink-muted">
          Clario does not independently verify every opportunity. Use these perspectives alongside the opportunity details and what you can confirm yourself.
        </p>
      </Card>

      <div className="flex flex-wrap items-center gap-2" aria-label="Sort senior insights">
        <span className="mr-1 text-sm font-medium text-ink">Sort by</span>
        <SortLink href="/insights?sort=reviewed" active={sort === "reviewed"}>Most reviewed</SortLink>
        <SortLink href="/insights?sort=rated" active={sort === "rated"}>Highest rated</SortLink>
        <SortLink href="/insights?sort=recent" active={sort === "recent"}>Most recent</SortLink>
      </div>

      {sortedOpportunities.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {sortedOpportunities.map((opportunity) => (
            <Card key={opportunity.id} className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl">{opportunity.title}</h2>
                  <p className="mt-1 text-sm text-ink-muted">
                    {opportunity.organization ?? "Organization not provided"} · {formatCategory(opportunity.category)}
                  </p>
                </div>
                {opportunity.averageRating !== null ? (
                  <span className="shrink-0 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent-dark">
                    {opportunity.averageRating}/10
                  </span>
                ) : null}
              </div>
              <p className="mt-4 text-sm text-ink-muted">
                {opportunity.reviewCount} review{opportunity.reviewCount === 1 ? "" : "s"}
              </p>
              <blockquote className="mt-4 line-clamp-3 border-l-2 border-accent/40 pl-3 text-sm leading-relaxed text-ink">
                “{opportunity.latestReview.body}”
              </blockquote>
              <div className="mt-auto pt-5">
                <Link
                  href={
                    ownedAnalysisIds.has(opportunity.id)
                      ? `/analyze/${opportunity.id}`
                      : `/analyze?opportunityId=${encodeURIComponent(opportunity.id)}`
                  }
                  className="text-sm font-medium text-accent hover:underline"
                >
                  {ownedAnalysisIds.has(opportunity.id) ? "View opportunity analysis →" : "Analyze opportunity →"}
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <h2 className="font-display text-2xl">No Senior Insights yet</h2>
          <p className="mt-2 text-ink-muted">
            Community experiences will appear here as students share what they learned from opportunities.
          </p>
          <Link href="/analyze" className="mt-4 inline-flex text-sm font-medium text-accent hover:underline">
            Analyze an opportunity →
          </Link>
        </Card>
      )}
    </div>
  );
}

function SortLink({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
        active ? "border-accent bg-accent-soft text-accent-dark" : "border-line text-ink-muted hover:border-accent/40"
      }`}
    >
      {children}
    </Link>
  );
}

function formatCategory(category: string) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}
