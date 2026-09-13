export const dynamic = "force-dynamic";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/server";
import { getProfileForUser } from "@/lib/db/profile";
import { getPersonalizedOpportunityFeed } from "@/lib/db/feed";

export const metadata = {
  title: "Feed",
};

export default async function FeedPage() {
  const user = await getCurrentUser();
  const profile = user ? await getProfileForUser(user.id).catch(() => null) : null;
  const opportunities = await getPersonalizedOpportunityFeed(profile, user?.id ?? "");
  const hasMatchingProfileData = Boolean(
    profile &&
      (profile.interests.length ||
        profile.skills.length ||
        profile.goals.length ||
        profile.experienceLevel),
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">Your feed</p>
        <h1 className="mt-2 font-display text-4xl">Opportunities worth exploring</h1>
        <p className="mt-3 max-w-2xl text-ink-muted">
          {hasMatchingProfileData
            ? "Ranked using the profile details you provided. Relevance is a helpful signal, not a verdict."
            : "Add interests, skills, goals, or experience to make these recommendations more relevant to you."}
        </p>
      </div>
      {!hasMatchingProfileData ? (
        <Card className="border-accent/20 bg-accent-soft/40">
          <p className="font-medium text-ink">
            {profile ? "Complete your profile for better matches" : "Add profile details for better matches"}
          </p>
          <p className="mt-2 text-sm text-ink-muted">
            The feed can still show opportunities, but interests, skills, goals, or experience make its ranking more useful.
          </p>
          <Link href="/profile" className="mt-4 inline-flex text-sm font-medium text-accent hover:underline">Open Profile →</Link>
        </Card>
      ) : null}
      {opportunities.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {opportunities.map((opportunity) => (
            <Card key={opportunity.id} className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="break-words font-display text-2xl">{opportunity.title}</h2>
                  <p className="mt-1 text-sm text-ink-muted">
                    {opportunity.organization ?? "Organization not provided"} · {formatCategory(opportunity.category)}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent-dark">
                  {opportunity.relevanceScore === null
                    ? "Limited profile match"
                    : `Profile match: ${opportunity.relevanceScore}%`}
                </span>
              </div>
              <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-ink-muted">{opportunity.description}</p>
              <div className="mt-4">
                <p className="text-sm font-medium text-ink">Profile match</p>
                {opportunity.matchReasons.length ? (
                  <ul className="mt-1 space-y-1 text-sm text-accent-dark">
                    {opportunity.matchReasons.map((reason) => <li key={reason}>• {reason}</li>)}
                  </ul>
                ) : (
                  <p className="mt-1 text-sm text-ink-muted">
                    {hasMatchingProfileData
                      ? "No profile signals matched this opportunity yet."
                      : "Complete your profile to see why this opportunity may be relevant."}
                  </p>
                )}
              </div>
              <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-line pt-4 text-xs text-ink-muted">
                {opportunity.analysisScore !== null ? (
                  <span>AI analysis: {opportunity.analysisScore}/100 signal</span>
                ) : null}
                <span>
                  Senior Insights:{" "}
                  {opportunity.reviewCount
                    ? `${opportunity.reviewCount} student review${opportunity.reviewCount === 1 ? "" : "s"}`
                    : "none yet"}
                </span>
                {opportunity.averageRating !== null ? <span>{opportunity.averageRating}/10 average opinion</span> : null}
                <Link
                  href={
                    opportunity.hasAnalysis
                      ? `/analyze/${opportunity.id}`
                      : `/analyze?opportunityId=${encodeURIComponent(opportunity.id)}`
                  }
                  className="ml-auto rounded-lg bg-accent px-3 py-2 text-center font-medium text-white hover:bg-accent-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                >
                  {opportunity.hasAnalysis ? "View analysis →" : "Analyze opportunity →"}
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <h2 className="font-display text-2xl">No opportunities yet</h2>
          <p className="mt-2 text-ink-muted">Analyze an opportunity to start building your personalized feed.</p>
          <Link href="/analyze" className="mt-4 inline-flex text-sm font-medium text-accent hover:underline">Analyze an opportunity →</Link>
        </Card>
      )}
    </div>
  );
}

function formatCategory(category: string) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}
