import { Card } from "@/components/ui/card";

export function FeaturePlaceholder({
  title,
  summary,
  coming,
}: {
  title: string;
  summary: string;
  coming: string[];
}) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="text-sm font-medium text-accent">Coming next</p>
        <h1 className="mt-1 font-display text-3xl text-ink">{title}</h1>
        <p className="mt-3 text-ink-muted">{summary}</p>
      </div>
      <Card>
        <p className="text-sm font-medium text-ink">What this page will do</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink-muted">
          {coming.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
