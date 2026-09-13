import { Card } from "@/components/ui/card";
import { EvidenceBadge } from "@/components/opportunity/evidence-badge";
import {
  DEMO_ANALYSIS,
  DEMO_REVIEWS,
  DEMO_TRUST,
} from "@/lib/demo/sample-analysis";

export function SampleAnalysisPreview() {
  const analysis = DEMO_ANALYSIS;
  const review = DEMO_REVIEWS[0];

  return (
    <div className="space-y-4">
      <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">
        Static demo preview · not live AI output
      </p>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <h3 className="text-sm font-semibold text-ink">What you provided</h3>
          <dl className="mt-3 space-y-2 text-sm">
            {Object.entries(analysis.extractedFromUser).map(([key, value]) => (
              <div key={key} className="flex justify-between gap-3">
                <dt className="capitalize text-ink-muted">{key}</dt>
                <dd className="text-right text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>
        <Card className="lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-ink">AI reading</h3>
            <EvidenceBadge kind="ai_interpretation" />
          </div>
          <p className="mt-3 font-display text-4xl text-ink">
            {analysis.overallScore.value}
            <span className="text-lg text-ink-muted"> / 10</span>
          </p>
          <p className="mt-2 text-sm text-ink-muted">{analysis.verdict.value}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">
                Strengths
              </p>
              <p className="mt-1 text-sm">{analysis.strengths[0]?.value}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">
                Concerns
              </p>
              <p className="mt-1 text-sm">{analysis.concerns[0]?.value}</p>
            </div>
          </div>
        </Card>
      </div>
      <Card className="bg-warn-soft/60">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-ink">Ask before you commit</h3>
          <EvidenceBadge kind="unverified" />
        </div>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink">
          {analysis.missingToVerify.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Card>
      <Card>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">
              Senior consensus
            </p>
            <p className="mt-1 font-display text-3xl">
              {DEMO_TRUST.seniorConsensus}
              <span className="text-base text-ink-muted"> / 10</span>
            </p>
          </div>
          <p className="max-w-sm text-sm text-ink-muted">{DEMO_TRUST.disclaimer}</p>
        </div>
        {review ? (
          <blockquote className="mt-4 border-t border-line pt-4 text-sm">
            <p className="text-ink">“{review.body}”</p>
            <footer className="mt-2 text-ink-muted">
              Year {review.studentYear} · {review.branch} · {review.experienceDuration}
            </footer>
          </blockquote>
        ) : null}
      </Card>
    </div>
  );
}
