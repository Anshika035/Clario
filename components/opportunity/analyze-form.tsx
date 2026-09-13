"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { opportunityInputSchema, normalizeOpportunityInput } from "@/lib/validation/opportunity";
import type { OpportunityInput } from "@/types/opportunity";
import type { OpportunityCategory } from "@/types/common";

const categories: { value: OpportunityCategory; label: string }[] = [
  { value: "internship", label: "Internship" },
  { value: "hackathon", label: "Hackathon" },
  { value: "course", label: "Course" },
  { value: "competition", label: "Competition" },
  { value: "certification", label: "Certification" },
  { value: "club", label: "Club/Event" },
  { value: "other", label: "Other" },
];

type FormValues = {
  title: string;
  description: string;
  organization: string;
  category: OpportunityCategory;
  url: string;
};

const emptyValues: FormValues = {
  title: "",
  description: "",
  organization: "",
  category: "internship",
  url: "",
};

export function AnalyzeForm({ initialInput }: { initialInput?: OpportunityInput | null }) {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>(
    initialInput
      ? {
          title: initialInput.title,
          description: initialInput.description,
          organization: initialInput.organization ?? "",
          category: initialInput.category,
          url: initialInput.url ?? "",
        }
      : emptyValues,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function updateField(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const parsed = opportunityInputSchema.safeParse({
      ...values,
      organization: values.organization || undefined,
      url: values.url || undefined,
    });
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string" && !nextErrors[field]) {
          nextErrors[field] = issue.message;
        }
      }
      setErrors(nextErrors);
      return;
    }

    setPending(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalizeOpportunityInput(parsed.data)),
      });
      const payload: { id?: string; error?: string } = await response.json();
      if (!response.ok || !payload.id) {
        setFormError(payload.error ?? "The analysis could not be completed.");
        return;
      }
      router.push(`/analyze/${payload.id}`);
    } catch {
      setFormError("We could not reach the analyzer. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
          Opportunity analyzer
        </p>
        <h1 className="mt-2 font-display text-4xl text-ink">Should you spend time on this?</h1>
        <p className="mt-3 max-w-2xl text-ink-muted">
          Share what you know. Clario will separate your facts from its interpretation and point
          out what still needs checking.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Field
            label="Opportunity title"
            name="title"
            value={values.title}
            onChange={(value) => updateField("title", value)}
            placeholder="e.g. Summer web development internship"
            maxLength={120}
            error={errors.title}
          />

          <label className="block space-y-2">
            <span className="text-base font-medium text-ink">Description and details</span>
            <span className="block text-sm text-ink-muted">Paste the opportunity details you have.</span>
            <textarea
              name="description"
              value={values.description}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="Paste the offer, requirements, schedule, stipend, deliverables, or anything else you were told."
              maxLength={8000}
              rows={8}
              className={`min-h-56 w-full resize-y rounded-xl border bg-card px-4 py-3 text-ink outline-none transition-colors placeholder:text-ink-muted/70 focus:border-accent ${
                errors.description ? "border-warn" : "border-line"
              }`}
            />
            <span className="block text-xs text-ink-muted">{values.description.length}/8000</span>
            {errors.description ? <span className="block text-sm text-warn">{errors.description}</span> : null}
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Organization or company"
              name="organization"
              value={values.organization}
              onChange={(value) => updateField("organization", value)}
              placeholder="Optional"
              maxLength={160}
              error={errors.organization}
            />
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-ink">Category</span>
              <select
                name="category"
                value={values.category}
                onChange={(event) => updateField("category", event.target.value)}
                className="w-full rounded-lg border border-line bg-card px-3 py-2.5 text-ink outline-none focus:border-accent"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <Field
            label="Link"
            name="url"
            type="url"
            value={values.url}
            onChange={(value) => updateField("url", value)}
            placeholder="https://example.com/opportunity (optional)"
            maxLength={500}
            error={errors.url}
          />

          {formError ? (
            <p className="rounded-lg border border-warn/30 bg-warn-soft px-3 py-2 text-sm text-warn">
              {formError}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-xs text-ink-muted">AI assists. Seniors advise. You decide.</p>
              {pending ? (
                <p role="status" className="text-xs text-ink-muted">
                  Reviewing the opportunity details you provided…
                </p>
              ) : null}
            </div>
            <Button type="submit" disabled={pending}>
              {pending ? "Analyzing your opportunity…" : "Analyze opportunity"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  maxLength,
  error,
  type = "text",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength: number;
  error?: string;
  type?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full rounded-lg border bg-card px-3 py-2.5 text-ink outline-none transition-colors placeholder:text-ink-muted/70 focus:border-accent ${
          error ? "border-warn" : "border-line"
        }`}
      />
      {error ? <span className="block text-sm text-warn">{error}</span> : null}
    </label>
  );
}
