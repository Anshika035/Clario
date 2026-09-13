"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { SeniorReview } from "@/types/review";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function SeniorInsights({
  opportunityId,
  currentUserId,
  initialReviews,
  initialAverageRating,
}: {
  opportunityId: string;
  currentUserId: string;
  initialReviews: SeniorReview[];
  initialAverageRating: number | null;
}) {
  const router = useRouter();
  const [reviews, setReviews] = useState(initialReviews);
  const [averageRating, setAverageRating] = useState(initialAverageRating);
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (successTimer.current) {
        clearTimeout(successTimer.current);
      }
    };
  }, []);

  function showSuccess(message: string) {
    if (successTimer.current) {
      clearTimeout(successTimer.current);
    }
    setSuccessMessage(message);
    successTimer.current = setTimeout(() => setSuccessMessage(null), 2500);
  }

  async function reloadReviews() {
    const response = await fetch(`/api/opportunities/${opportunityId}/reviews`, {
      cache: "no-store",
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error ?? "Could not reload senior reviews.");
    }
    setReviews(payload.reviews);
    setAverageRating(payload.consensus.averageRating);
  }

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setPending(true);
    setErrorMessage(null);
    const form = new FormData(formElement);
    const editingReview = reviews.find((review) => review.id === editingReviewId);
    const response = await fetch(
      editingReviewId
        ? `/api/opportunities/${opportunityId}/reviews/${editingReviewId}`
        : `/api/opportunities/${opportunityId}/reviews`,
      {
        method: editingReviewId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: form.get("body"),
          studentYear: Number(form.get("studentYear")),
          branch: form.get("branch"),
          experienceDuration: form.get("experienceDuration") || undefined,
          rating: form.get("rating") ? Number(form.get("rating")) : undefined,
        }),
      },
    );
    const payload = await response.json();
    if (!response.ok) {
      setErrorMessage(payload.error ?? "Could not save your review.");
    } else {
      try {
        await reloadReviews();
        formElement.reset();
        setEditingReviewId(null);
        showSuccess(editingReview ? "Your review was updated." : "Your review was added.");
        router.refresh();
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Could not reload senior reviews.");
      }

    }

    setPending(false);
  }

  function startEditing(review: SeniorReview) {
    setErrorMessage(null);
    setEditingReviewId(review.id);
  }

  function cancelEditing() {
    setErrorMessage(null);
    setEditingReviewId(null);
  }

  async function deleteReview(reviewId: string) {
    if (!window.confirm("Delete your review?")) {
      return;
    }

    setPending(true);
    setErrorMessage(null);
    const response = await fetch(`/api/opportunities/${opportunityId}/reviews/${reviewId}`, {
      method: "DELETE",
    });
    const payload = response.status === 204 ? null : await response.json();
    if (!response.ok) {
      setErrorMessage(payload?.error ?? "Could not delete your review.");
    } else {
      try {
        await reloadReviews();
        showSuccess("Your review was deleted.");
        router.refresh();
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Could not reload senior reviews.");
      }
    }
    setPending(false);
  }

  return (
    <Card className="border-provided/30">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-provided">Second perspective</p>
          <h2 className="mt-1 font-display text-3xl">Senior Insights</h2>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-paper p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">Community rating</p>
          <p className="mt-1 font-display text-3xl text-ink">
            {averageRating === null ? "—" : averageRating}
            <span className="text-base text-ink-muted"> / 10</span>
          </p>
        </div>
        <div className="rounded-xl bg-paper p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">Shared experiences</p>
          <p className="mt-1 font-display text-3xl text-ink">{reviews.length}</p>
          <p className="text-xs text-ink-muted">student review{reviews.length === 1 ? "" : "s"}</p>
        </div>
      </div>
      <p className="mt-4 text-sm text-ink-muted">
        Senior Insights add personal experiences and opinions to your context. They are not guarantees or a
        replacement for the AI analysis and verification checks.
      </p>

      <div className="mt-6 space-y-4">
        {reviews.length ? (
          reviews.map((review) => (
            <div key={review.id} className="rounded-xl border border-line bg-paper p-4">
              <p className="text-sm leading-relaxed text-ink">“{review.body}”</p>
              <p className="mt-3 text-xs text-ink-muted">
                Year {review.studentYear} · {review.branch}
                {review.experienceDuration ? ` · ${review.experienceDuration}` : ""}
                {review.rating === undefined ? "" : ` · ${review.rating}/10`}
              </p>
              {String(review.authorId) === String(currentUserId) ? (
                <div className="mt-2 flex gap-2">
                  <Button variant="secondary" size="sm" disabled={pending} onClick={() => startEditing(review)}>
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={pending}
                    onClick={() => deleteReview(review.id)}
                    className="text-warn"
                  >
                    Delete
                  </Button>
                </div>
              ) : null}
            </div>
          ))
        ) : (
          <p className="text-sm text-ink-muted">No senior reviews yet. Be the first to share context.</p>
        )}
      </div>

      <form key={editingReviewId ?? "new-review"} onSubmit={submitReview} className="mt-6 space-y-4 border-t border-line pt-5">
        <h3 className="font-medium text-ink">{editingReviewId ? "Edit your experience" : "Share your experience"}</h3>
        {editingReviewId ? (
          <p className="text-sm text-ink-muted">Update your review and rating, then save your changes.</p>
        ) : null}
        <textarea
          name="body"
          required
          minLength={50}
          maxLength={1000}
          rows={4}
          placeholder="What should other students know?"
          className="w-full resize-y rounded-lg border border-line bg-white px-3 py-2.5 text-ink outline-none focus:border-accent"
          defaultValue={editingReviewId ? reviews.find((review) => review.id === editingReviewId)?.body : undefined}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="text-sm text-ink">
            Year
            <select name="studentYear" defaultValue={editingReviewId ? reviews.find((review) => review.id === editingReviewId)?.studentYear : 1} className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2.5">
              {[1, 2, 3, 4].map((year) => <option key={year}>{year}</option>)}
            </select>
          </label>
          <label className="text-sm text-ink">
            Branch
            <input name="branch" required minLength={2} maxLength={80} defaultValue={editingReviewId ? reviews.find((review) => review.id === editingReviewId)?.branch : undefined} className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2.5" />
          </label>
          <label className="text-sm text-ink">
            Rating /10
            <input name="rating" type="number" min="0" max="10" step="0.1" defaultValue={editingReviewId ? reviews.find((review) => review.id === editingReviewId)?.rating : undefined} className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2.5" />
          </label>
        </div>
        <input name="experienceDuration" placeholder="Experience context (optional)" maxLength={80} defaultValue={editingReviewId ? reviews.find((review) => review.id === editingReviewId)?.experienceDuration : undefined} className="w-full rounded-lg border border-line bg-white px-3 py-2.5" />
        {errorMessage ? <p className="text-sm text-warn">{errorMessage}</p> : null}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={pending}>{pending ? (editingReviewId ? "Saving…" : "Submitting…") : editingReviewId ? "Save changes" : "Submit review"}</Button>
          {editingReviewId ? <Button type="button" variant="secondary" disabled={pending} onClick={cancelEditing}>Cancel</Button> : null}
        </div>
      </form>
      <div aria-live="polite" role="status" className="min-h-5 text-sm text-accent-dark">
        {successMessage}
      </div>
    </Card>
  );
}
