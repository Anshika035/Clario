import Link from "next/link";
import { SampleAnalysisPreview } from "@/components/landing/sample-analysis-preview";
import {
  AppMobileNav,
  AppSidebar,
  AppTopBar,
} from "@/components/layout/app-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { getCurrentUser } from "@/lib/auth/server";
import { getProfileForUser } from "@/lib/db/profile";
import { getRecentAnalyzedOpportunities } from "@/lib/db/opportunities";
import { getRecentSeniorReviews, type RecentSeniorReview } from "@/lib/db/reviews";
import type { Profile } from "@/types/profile";
import type { RecentAnalyzedOpportunity } from "@/lib/db/opportunities";

const features = [
  {
    title: "AI Opportunity Analysis",
    body: "Paste an internship, hackathon, course, or club offer. Clario scores what is in the text, labels guesses as guesses, and lists what you still need to verify.",
  },
  {
    title: "Senior Insights",
    body: "Read what older students actually experienced. Their reviews are opinions — useful context, not a universal truth.",
  },
  {
    title: "College AI Assistant",
    body: "A companion for students who do not know where to start. It explains DSA, GitHub, internships, and first-year paths in plain language.",
  },
];

const steps = [
  {
    n: "1",
    title: "AI analyzes what you pasted",
    body: "It works from the information you provided. It does not invent company facts.",
  },
  {
    n: "2",
    title: "Seniors add real-world context",
    body: "Experiences from students who were already there — certificates, workload, and what felt worth it.",
  },
  {
    n: "3",
    title: "You make the final decision",
    body: "Clario is a second opinion, not a verdict. The call stays yours.",
  },
];

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) {
    const [profile, recentOpportunities, recentReviews] = await Promise.all([
      getProfileForUser(user.id),
      getRecentAnalyzedOpportunities(user.id),
      getRecentSeniorReviews(),
    ]);
    return (
      <AuthenticatedHome
        profile={profile}
        recentOpportunities={recentOpportunities}
        recentReviews={recentReviews}
      />
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main>
        <section className="border-b border-line">
          <Container className="grid gap-10 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:py-24">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
                For college students, especially freshers
              </p>
              <h1 className="mt-4 max-w-xl font-display text-4xl leading-tight text-ink sm:text-5xl">
                AI assists. Seniors advise. You decide.
              </h1>
              <p className="mt-5 max-w-lg text-lg text-ink-muted">
                Internships, hackathons, courses, clubs, and certificates arrive in a flood.
                Most first-year students have no way to tell what is valuable, relevant, or a
                waste of time.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/signup"
                  className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-dark"
                >
                  Create a free account
                </Link>
                <Link
                  href="#how-it-works"
                  className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-medium text-ink hover:border-ink/30"
                >
                  See how it works
                </Link>
              </div>
            </div>
            <Card className="bg-accent-soft/50">
              <p className="text-sm font-medium text-accent-dark">The idea</p>
              <p className="mt-3 font-display text-2xl italic leading-snug text-ink">
                AI should assist student decision-making, not replace human experience.
              </p>
            </Card>
          </Container>
        </section>

        <section id="how-it-works" className="py-16">
          <Container>
            <h2 className="font-display text-3xl">How Clario works</h2>
            <p className="mt-3 max-w-2xl text-ink-muted">
              AI reads the information you share. Senior experiences add context. You keep the
              decision.
            </p>
            <ol className="mt-8 grid gap-4 md:grid-cols-3">
              {steps.map((step) => (
                <li key={step.n}>
                  <Card className="h-full">
                    <p className="font-display text-3xl text-accent">{step.n}</p>
                    <h3 className="mt-3 font-medium text-ink">{step.title}</h3>
                    <p className="mt-2 text-sm text-ink-muted">{step.body}</p>
                  </Card>
                </li>
              ))}
            </ol>
          </Container>
        </section>

        <section className="border-y border-line bg-card/60 py-16">
          <Container>
            <h2 className="font-display text-3xl">Built for first-year questions</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="h-full">
                  <h3 className="font-medium text-ink">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {feature.body}
                  </p>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        <section className="py-16">
          <Container>
            <h2 className="font-display text-3xl">We do not fake certainty</h2>
            <p className="mt-3 max-w-2xl text-ink-muted">
              Clario will not call an opportunity legitimate or fraudulent without evidence.
              Every analysis separates what you typed, what the AI inferred, and what nobody
              can verify from the paste alone.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <Card>
                <p className="text-sm font-medium text-provided">You provided</p>
                <p className="mt-2 text-sm text-ink-muted">
                  Copied from your paste. Treated as given, not researched.
                </p>
              </Card>
              <Card>
                <p className="text-sm font-medium text-accent-dark">AI reading</p>
                <p className="mt-2 text-sm text-ink-muted">
                  Interpretation and tradeoffs. Helpful, still a guess.
                </p>
              </Card>
              <Card>
                <p className="text-sm font-medium text-warn">Unverified</p>
                <p className="mt-2 text-sm text-ink-muted">
                  Questions to take back to the organizer before you say yes.
                </p>
              </Card>
            </div>
          </Container>
        </section>

        <section className="border-t border-line bg-card/40 py-16">
          <Container>
            <div className="mb-8 max-w-2xl">
              <h2 className="font-display text-3xl">A sample reading</h2>
              <p className="mt-3 text-ink-muted">
                Unpaid web internship, three months, certificate included. This preview is
                static demo content so you can see the product shape before AI is wired in.
              </p>
            </div>
            <SampleAnalysisPreview />
          </Container>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function AuthenticatedHome({
  profile,
  recentOpportunities,
  recentReviews,
}: {
  profile: Profile | null;
  recentOpportunities: RecentAnalyzedOpportunity[];
  recentReviews: RecentSeniorReview[];
}) {
  return (
    <div className="min-h-dvh bg-paper">
      <AppSidebar />
      <div className="lg:pl-60">
        <AppTopBar />
        <main className="px-4 py-8 pb-24 lg:px-8 lg:pb-10">
          <div className="mx-auto max-w-5xl">
            <section className="max-w-3xl">
              <p className="text-sm font-semibold tracking-tight text-accent">Clario</p>
              <h1 className="mt-2 font-display text-4xl leading-[1.12] text-ink sm:text-5xl">Make better decisions about where you spend your time.</h1>
              <p className="mt-5 text-lg leading-relaxed text-ink-muted">
                AI assists. Seniors advise. You decide.
              </p>
              <p className="mt-3 max-w-2xl leading-relaxed text-ink-muted">
                Clario helps you evaluate internships, hackathons, courses, clubs, and other
                opportunities before you commit your time.
              </p>
              <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                <ButtonLink
                  href="/analyze"
                  className="w-full sm:w-auto"
                >
                  Analyze an opportunity
                </ButtonLink>
                <ButtonLink
                  href="/feed"
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  Explore your feed
                </ButtonLink>
              </div>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted">
                Paste an internship, hackathon, course, or other opportunity to see if it&apos;s worth your time.
              </p>
            </section>

            <section className="mt-14">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl leading-tight text-ink sm:text-2xl">Your profile</h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    A snapshot of what Clario uses to personalize your experience.
                  </p>
                </div>
                <Link href="/profile" className="shrink-0 text-sm font-medium text-accent hover:underline">
                  Edit profile
                </Link>
              </div>
              <Card className="mt-5">
                {profile && hasProfileDetails(profile) ? (
                  <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                    <ProfileDetail label="Year" value={profile.year ? `Year ${profile.year}` : null} />
                    <ProfileDetail label="Branch" value={profile.branch} />
                    <ProfileDetail label="Experience" value={formatLabel(profile.experienceLevel)} />
                    <ProfileDetail label="Interests" value={profile.interests} tags />
                    <ProfileDetail label="Skills" value={profile.skills} tags />
                    <ProfileDetail label="Goals" value={profile.goals} tags className="sm:col-span-2 lg:col-span-3" />
                  </div>
                ) : (
                  <p className="text-sm text-ink-muted">
                    Complete your profile to get more personalized recommendations.
                  </p>
                )}
              </Card>
            </section>

            <section className="mt-14">
              <div>
                <h2 className="font-display text-xl leading-tight text-ink sm:text-2xl">How Clario helps</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  Practical context for choosing opportunities with more confidence.
                </p>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <FeatureLink
                  href="/analyze"
                  icon="01"
                  title="Analyze opportunities"
                  description="See the value, effort, risks, and open questions before you commit your time."
                />
                <FeatureLink
                  href="/feed"
                  icon="02"
                  title="Personalized feed"
                  description="Find opportunities that connect with your interests, skills, and goals."
                />
                <FeatureLink
                  href="/insights"
                  icon="03"
                  title="Senior insights"
                  description="Add real student experiences to the context behind your decision."
                />
                <FeatureLink
                  href="/assistant"
                  icon="04"
                  title="AI assistant"
                  description="Work through questions about opportunities, skills, projects, academics, and your next step."
                />
              </div>
            </section>

            <section className="mt-14">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl leading-tight text-ink sm:text-2xl">Recent activity</h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">Your latest opportunity analyses.</p>
                </div>
                <Link href="/analyze" className="shrink-0 text-sm font-medium text-accent hover:underline">
                  Analyze another
                </Link>
              </div>
              {recentOpportunities.length ? (
                <div className="mt-5 space-y-3">
                  {recentOpportunities.map((opportunity) => (
                    <Link
                      key={`${opportunity.id}-${opportunity.analyzedAt}`}
                      href={`/analyze/${opportunity.id}`}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-card p-4 transition-colors hover:border-accent/50"
                    >
                      <div>
                        <p className="font-medium text-ink">{opportunity.title}</p>
                        <p className="mt-1 text-sm text-ink-muted">
                          {opportunity.organization ?? "Organization not provided"} · {formatDate(opportunity.analyzedAt)}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-accent">
                        {opportunity.score === null ? "Score unavailable" : `AI score ${opportunity.score}/100`}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <Card className="mt-5">
                  <p className="font-medium text-ink">No analyzed opportunities yet.</p>
                  <p className="mt-1 text-sm text-ink-muted">Start by analyzing an opportunity you&apos;re considering.</p>
                  <Link href="/analyze" className="mt-4 inline-flex text-sm font-medium text-accent hover:underline">
                    Analyze your first opportunity
                  </Link>
                </Card>
              )}
            </section>

            {recentReviews.length ? (
              <section className="mt-14">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h2 className="font-display text-xl leading-tight text-ink sm:text-2xl">What students are saying</h2>
                    <p className="mt-2 text-sm leading-relaxed text-ink-muted">Personal experiences and opinions, not guarantees.</p>
                  </div>
                  <Link href="/insights" className="shrink-0 text-sm font-medium text-accent hover:underline">
                    Explore Senior Insights
                  </Link>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  {recentReviews.map((review) => (
                    <Card key={review.id} className="p-4">
                      <p className="text-sm font-medium text-ink">{review.opportunityTitle}</p>
                      <p className="mt-1 text-xs text-ink-muted">
                        {review.organization ?? "Organization not provided"} · {formatDate(review.createdAt)}
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-ink-muted">“{review.body}”</p>
                      {review.rating !== undefined ? (
                        <p className="mt-3 text-sm font-medium text-accent">{review.rating}/10 rating</p>
                      ) : null}
                    </Card>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="mt-16 border-t border-line py-10 text-center">
              <p className="font-display text-xl text-ink">AI assists. Seniors advise. You decide.</p>
              <p className="mt-2 text-sm text-ink-muted">
                Clario helps you make an informed decision — it doesn&apos;t make the decision for you.
              </p>
            </section>
          </div>
        </main>
      </div>
      <AppMobileNav />
    </div>
  );
}

function hasProfileDetails(profile: Profile) {
  return Boolean(
    profile.year ||
      profile.branch ||
      profile.experienceLevel ||
      profile.interests.length ||
      profile.skills.length ||
      profile.goals.length,
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(value),
  );
}

function formatLabel(value: string | null) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : null;
}

function ProfileDetail({
  label,
  value,
  tags = false,
  className = "",
}: {
  label: string;
  value: string | string[] | null;
  tags?: boolean;
  className?: string;
}) {
  const values = Array.isArray(value) ? value : [];

  return (
    <div className={className}>
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">{label}</p>
      {tags ? (
        values.length ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {values.map((item, index) => (
              <span
                key={`${item}-${index}`}
                className="rounded-md border border-line bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent-dark"
              >
                {item}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-1.5 text-sm font-medium text-ink">Not set</p>
        )
      ) : (
        <p className="mt-1 text-base font-medium text-ink">{value ?? "Not set"}</p>
      )}
    </div>
  );
}

function FeatureLink({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-line bg-card p-5 transition-colors hover:border-accent/50"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-xs font-semibold tracking-wide text-accent" aria-hidden="true">
        {icon}
      </span>
      <h3 className="mt-4 font-medium leading-snug text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink">{description}</p>
      <span className="mt-4 inline-block text-xs font-medium uppercase tracking-wider text-ink-muted group-hover:text-accent">
        Explore
      </span>
    </Link>
  );
}
