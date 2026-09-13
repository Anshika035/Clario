"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Profile } from "@/types/profile";

function listValue(values: string[]) {
  return values.join(", ");
}

export function ProfileForm({ initialProfile }: { initialProfile: Profile | null }) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (successTimer.current) {
        clearTimeout(successTimer.current);
      }
    };
  }, []);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    const splitList = (name: string) =>
      String(form.get(name) ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);

    const response = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        year: form.get("year") ? Number(form.get("year")) : null,
        branch: String(form.get("branch") ?? "").trim() || null,
        experienceLevel: String(form.get("experienceLevel") ?? "") || null,
        interests: splitList("interests"),
        skills: splitList("skills"),
        goals: splitList("goals"),
      }),
    });
    const payload = await response.json();
    if (response.ok) {
      if (successTimer.current) {
        clearTimeout(successTimer.current);
      }
      setMessage({ type: "success", text: "Your profile was saved." });
      successTimer.current = setTimeout(() => setMessage(null), 2750);
    } else {
      setMessage({ type: "error", text: payload.error ?? "Could not save your profile." });
    }
    setPending(false);
  }

  return (
    <Card className="max-w-2xl">
      <form onSubmit={saveProfile} className="space-y-5">
        <div>
          <h2 className="font-display text-2xl">Profile details</h2>
          <p className="mt-2 text-sm text-ink-muted">
            Complete your profile to get more relevant opportunity recommendations. Optional fields can be left blank.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="text-sm text-ink">
            Year <span className="text-ink-muted">(optional)</span>
            <select name="year" defaultValue={initialProfile?.year ?? ""} className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2.5">
              <option value="">Not set</option>
              {[1, 2, 3, 4].map((year) => <option key={year} value={year}>Year {year}</option>)}
            </select>
          </label>
          <label className="text-sm text-ink">
            Branch <span className="text-ink-muted">(optional)</span>
            <input name="branch" defaultValue={initialProfile?.branch ?? ""} placeholder="e.g. CSE" maxLength={80} className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2.5" />
          </label>
          <label className="text-sm text-ink">
            Experience <span className="text-ink-muted">(optional)</span>
            <select name="experienceLevel" defaultValue={initialProfile?.experienceLevel ?? ""} className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2.5">
              <option value="">Not set</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </label>
        </div>

        {([
          ["interests", "Interests", initialProfile?.interests ?? [], "e.g. web development, robotics"],
          ["skills", "Skills / languages", initialProfile?.skills ?? [], "e.g. Python, Git, communication"],
          ["goals", "Goals", initialProfile?.goals ?? [], "e.g. build projects, find an internship"],
        ] as const).map(([name, label, values, placeholder]) => (
          <label key={name} className="block text-sm text-ink">
            {label} <span className="text-ink-muted">(optional, comma-separated)</span>
            <textarea
              name={name}
              defaultValue={listValue(values as string[])}
              placeholder={placeholder}
              maxLength={500}
              rows={2}
              className="mt-1 w-full resize-y rounded-lg border border-line bg-white px-3 py-2.5"
            />
          </label>
        ))}

        {message ? (
          <p role="status" className={message.type === "error" ? "text-sm text-warn" : "text-sm text-accent-dark"}>
            {message.text}
          </p>
        ) : null}
        <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save profile"}</Button>
      </form>
    </Card>
  );
}
