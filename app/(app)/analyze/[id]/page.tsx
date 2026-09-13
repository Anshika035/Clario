import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { EvidenceBadge } from "@/components/opportunity/evidence-badge";
import { getCurrentUser } from "@/lib/auth/server";
import { getOpportunityAnalysisForUser } from "@/lib/db/opportunities";
import { getOpportunityReviews } from "@/lib/db/reviews";
import { SeniorInsights } from "@/components/opportunity/senior-insights";
import type { EvidenceKind } from "@/types/common";
import type { OpportunityAnalysisResult } from "@/types/analysis";

const verdictLabels = {
  strong_opportunity: "Strong opportunity",
  worth_considering: "Worth considering",
  mixed: "Mixed signals",
  low_priority: "Low priority",
  insufficient_information: "Not enough information yet",
} as const;

export default async function AnalysisResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  const { id } = await params;
  const result = user ? await getOpportunityAnalysisForUser(user.id, id) : null;

  if (!user || !result) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card>
          <p className="text-sm font-medium text-warn">Analysis unavailable</p>
          <h1 className="mt-2 font-display text-3xl">We could not find this analysis</h1>
          <p className="mt-3 text-ink-muted">
            It may have been removed, or you may not have access to it.
          </p>
          <Link href="/analyze" className="mt-6 inline-flex text-sm font-medium text-accent hover:underline">
            Analyze another opportunity
          </Link>
        </Card>
      </div>
    );
  }

  const { opportunity, analysis } = result;
  const reviews = await getOpportunityReviews(opportunity.id);
  const evidenceByKind = new Map<EvidenceKind, typeof analysis.evidence>();
  for (const evidence of analysis.evidence) {
    const current = evidenceByKind.get(evidence.kind) ?? [];
    current.push(evidence);
    evidenceByKind.set(evidence.kind, current);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="rounded-3xl border border-line bg-card p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
          <Link href="/analyze" className="text-sm font-medium text-accent hover:underline">
            ← Analyze another
          </Link>
          <p className="mt-5 text-sm font-medium uppercase tracking-[0.18em] text-accent">
            Opportunity analysis
          </p>
          <h1 className="mt-2 max-w-3xl font-display text-4xl leading-tight text-ink sm:text-5xl">{opportunity.title}</h1>
          <p className="mt-2 text-ink-muted">
            {opportunity.organization ?? "Organization not provided"} · {formatCategory(opportunity.category)}
          </p>
          </div>
          <div className="w-full rounded-2xl border border-accent/20 bg-accent-soft px-6 py-4 sm:w-auto sm:min-w-44 sm:text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-accent-dark">AI assessment</p>
            <p className="mt-1 font-display text-5xl text-accent-dark">{analysis.overallScore}<span className="text-2xl">/100</span></p>
            <p className="mt-1 text-xs text-accent-dark">A helpful signal, not a verdict</p>
          </div>
        </div>
        <div className="mt-6 border-t border-line pt-5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-accent">Current interpretation</p>
            <EvidenceBadge kind="ai_interpretation" compact />
          </div>
          <h2 className="mt-2 font-display text-2xl leading-snug">{verdictLabels[analysis.verdict]}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-muted">{analysis.summary}</p>
          <p className="mt-4 max-w-3xl text-base font-medium leading-relaxed text-ink">{analysis.recommendation}</p>
        </div>
      </div>

      <div className="rounded-xl border border-line bg-paper px-4 py-3 text-sm text-ink">
        <span className="font-medium">AI assists. Seniors advise. You decide.</span>{" "}
        <span className="text-ink-muted">Use each source as context, not as a guarantee.</span>
      </div>

      <FitForYouCard fitForYou={analysis.fitForYou} />

      <section aria-labelledby="ai-analysis-heading" className="space-y-4">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">AI analysis</p>
        <h2 id="ai-analysis-heading" className="mt-1 font-display text-3xl">A structured second opinion</h2>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ListCard title="Strengths" items={analysis.strengths} label="AI interpretation" />
        <ListCard title="Concerns" items={analysis.concerns} tone="warn" label="AI interpretation" />
        <ListCard title="Skills gained" items={analysis.skillsGained} label="AI interpretation" />
        <ListCard title="Credibility signals" items={analysis.credibilitySignals} label="AI interpretation; confirm independently" />
        <ListCard title="Best for" items={analysis.bestFor} label="AI interpretation" />
        <div id="verification" className="scroll-mt-6">
          <ListCard
            title="Needs verification"
            items={analysis.missingInformation}
            tone="warn"
            label="Check before committing"
          />
        </div>
      </div>

      <Card>
        <h2 className="font-display text-2xl">Value breakdown</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-4">
          <Score label="Learning" value={analysis.learningValue} />
          <Score label="Experience" value={analysis.experienceValue} />
          <Score label="Relevance" value={analysis.relevanceValue} />
          <Score label="Effort cost" value={analysis.effortValue} />
        </div>
      </Card>

      </section>

      <TrustEvidenceCard analysis={analysis} evidenceByKind={evidenceByKind} />

      <div id="senior-insights" className="scroll-mt-6">
        <SeniorInsights
          opportunityId={opportunity.id}
          currentUserId={user.id}
          initialReviews={reviews.reviews}
          initialAverageRating={reviews.consensus.averageRating}
        />
      </div>

      <Card className="border-accent/30 bg-accent-soft/40 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-accent">Next step</p>
            <h2 className="mt-1 font-display text-2xl">Ask Assistant about this opportunity</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
              Ask whether it is worth your time, what concerns to consider, what to verify, or what to do next.
            </p>
          </div>
          <ButtonLink
            href={`/assistant?opportunityId=${encodeURIComponent(opportunity.id)}`}
            aria-label={`Ask Assistant about ${opportunity.title}`}
            className="shrink-0"
          >
            Ask Assistant
          </ButtonLink>
        </div>
        <nav aria-label="More ways to continue" className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-accent/20 pt-4 text-sm">
          <a href="#verification" className="font-medium text-ink-muted hover:text-accent hover:underline">
            Check what needs verification
          </a>
          <a href="#senior-insights" className="font-medium text-ink-muted hover:text-accent hover:underline">
            Explore Senior Insights
          </a>
          <Link href="/analyze" className="font-medium text-ink-muted hover:text-accent hover:underline">
            Analyze another opportunity
          </Link>
        </nav>
      </Card>

    </div>
  );
}

function TrustEvidenceCard({
  analysis,
  evidenceByKind,
}: {
  analysis: OpportunityAnalysisResult;
  evidenceByKind: Map<EvidenceKind, typeof analysis.evidence>;
}) {
  return (
    <Card>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-accent">Decision context</p>
          <h2 className="mt-1 font-display text-2xl">Trust &amp; evidence</h2>
        </div>
        <p className="max-w-sm text-right text-xs text-ink-muted">
          Clario does not independently verify opportunities.
        </p>
      </div>
      <p className="mt-3 max-w-2xl text-sm text-ink-muted">
        Quickly separate what was supplied, what AI inferred, what students experienced, and what you should confirm.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <TrustCategory
          title="User-provided"
          description="Information taken directly from the opportunity you submitted."
        />
        <TrustCategory
          title="AI interpretation"
          description="A conclusion or interpretation generated by AI from the available information."
        />
        <TrustCategory
          title="Senior experience"
          description="A personal experience or opinion shared by a student/senior."
        />
        <TrustCategory
          title="Verify"
          description="Information that is missing, uncertain, or should be confirmed before deciding."
        />
      </div>
      <div className="mt-5 border-t border-line pt-5">
        <h3 className="text-sm font-semibold text-ink">Claims used in this analysis</h3>
        <div className="mt-3 space-y-3">
          {(["user_provided", "ai_interpretation", "unverified"] as EvidenceKind[]).map((kind) => (
            <div key={kind} className="rounded-xl bg-paper p-4">
              <div className="flex items-center justify-between gap-3">
                <EvidenceBadge kind={kind} />
                <span className="text-xs text-ink-muted">
                  {evidenceByKind.get(kind)?.length ?? 0} claim{(evidenceByKind.get(kind)?.length ?? 0) === 1 ? "" : "s"}
                </span>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-ink-muted">
                {(evidenceByKind.get(kind) ?? []).map((item) => (
                  <li key={item.claim}>{item.claim}</li>
                ))}
                {!evidenceByKind.has(kind) ? <li>No claims in this category.</li> : null}
              </ul>
            </div>
          ))}
          {!analysis.evidence.length ? (
            <p className="rounded-xl bg-warn-soft/50 p-4 text-sm text-ink">
              Some information may need verification because this older analysis has no evidence details.
            </p>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

function FitForYouCard({ fitForYou }: { fitForYou: OpportunityAnalysisResult["fitForYou"] }) {
  return (
    <Card className="border-accent/30 bg-accent-soft/30">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-accent">Personalized assessment</p>
          <h2 className="mt-1 font-display text-3xl">Fit for you</h2>
        </div>
        {fitForYou.profileLimited ? (
          <span className="rounded-full border border-line bg-card px-3 py-1 text-xs font-medium text-ink-muted">
            Limited personalization
          </span>
        ) : null}
      </div>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink">{fitForYou.summary}</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <FitList title="Why it may fit" items={fitForYou.matches} />
        <FitList title="Where to be careful" items={fitForYou.gaps} />
      </div>
      <div className="mt-5 grid gap-4 border-t border-line pt-4 md:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">Current readiness</p>
          <p className="mt-2 text-sm leading-relaxed text-ink">{fitForYou.readiness}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">Main tradeoff</p>
          <p className="mt-2 text-sm leading-relaxed text-ink">{fitForYou.tradeoff}</p>
        </div>
      </div>
    </Card>
  );
}

function FitList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">{title}</p>
      <ul className="mt-2 space-y-2 text-sm leading-relaxed text-ink">
        {items.map((item) => <li key={item}>• {item}</li>)}
      </ul>
    </div>
  );
}

function ListCard({
  title,
  items,
  label,
  tone = "default",
}: {
  title: string;
  items: string[];
  label?: string;
  tone?: "default" | "warn";
}) {
  return (
    <Card className={tone === "warn" ? "bg-warn-soft/50" : ""}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-2xl">{title}</h2>
        {label ? <span className="text-xs font-medium text-ink-muted">{label}</span> : null}
      </div>
      <ul className="mt-4 space-y-2 text-sm leading-relaxed text-ink-muted">
        {items.length ? items.map((item) => <li key={item}>• {item}</li>) : <li>Nothing listed.</li>}
      </ul>
    </Card>
  );
}

function TrustCategory({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-line bg-paper p-4">
      <h3 className="font-medium text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{description}</p>
    </div>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-ink-muted">{label}</span>
        <span className="font-medium text-ink">{value}</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-line">
        <div className="h-2 rounded-full bg-accent" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function formatCategory(category: string) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}
