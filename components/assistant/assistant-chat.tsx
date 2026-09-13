"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { AssistantMessage } from "@/types/assistant";

const exampleQuestions = [
  "What is DSA, and how should I start learning it?",
  "How do I choose my first college project?",
  "What should I check before joining an unpaid internship?",
];

export function AssistantChat({
  initialMessages,
  opportunityId,
  opportunitySummary,
}: {
  initialMessages: AssistantMessage[];
  opportunityId?: string;
  opportunitySummary?: {
    title: string;
    organization: string | null;
    overallScore: number;
    averageRating: number | null;
  } | null;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [question, setQuestion] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = question.trim();
    if (!content || pending) {
      return;
    }

    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, opportunityId }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setError("The assistant could not answer right now. Please try again.");
      } else {
        setMessages((current) => [...current, ...payload.messages]);
        setQuestion("");
      }
    } catch {
      setError("We could not reach the assistant. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">Clario assistant</p>
        <h1 className="mt-2 font-display text-4xl text-ink">A calmer starting point for college questions.</h1>
        <p className="mt-3 text-ink-muted">
          Get guidance, not verdicts. The assistant will separate what you tell it from its interpretation and
          call out what you still need to verify.
        </p>
      </div>

      {opportunitySummary ? (
        <Card className="mt-5 border-accent/30 bg-paper shadow-none">
          <p className="text-xs font-medium uppercase tracking-wider text-accent-dark">
            Discussing this opportunity
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <p className="min-w-0 font-medium text-ink">
              <span className="break-words">{opportunitySummary.title}</span>
              {opportunitySummary.organization ? (
                <span className="text-ink-muted"> · {opportunitySummary.organization}</span>
              ) : null}
            </p>
            <p className="shrink-0 text-sm text-ink-muted">
              AI score: {opportunitySummary.overallScore}/100 · Senior consensus:{" "}
              {opportunitySummary.averageRating === null ? "No ratings" : `${opportunitySummary.averageRating}/10`}
            </p>
          </div>
        </Card>
      ) : null}

      <Card className="mt-8 shadow-none">
        <div className="min-h-80 space-y-4">
          {messages.length === 0 ? (
            <div className="rounded-xl border border-line bg-paper p-5">
              <p className="font-medium text-ink">What would you like to figure out?</p>
              <p className="mt-2 text-sm text-ink-muted">Try one of these:</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {exampleQuestions.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => setQuestion(example)}
                    className="rounded-lg border border-line bg-card px-3 py-2 text-left text-sm text-ink-muted hover:border-accent"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[90%] rounded-xl p-4 ${
                  message.role === "user"
                    ? "ml-auto bg-ink text-paper dark:bg-accent-soft dark:text-ink"
                    : "border border-line bg-paper text-ink dark:bg-paper"
                }`}
              >
                <p className="mb-1 text-xs font-medium uppercase tracking-wider opacity-70">
                  {message.role === "user" ? "You provided" : "Assistant guidance"}
                </p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
              </div>
            ))
          )}
        </div>

        {error ? <p className="mt-4 text-sm text-warn">{error}</p> : null}
        <form onSubmit={sendQuestion} className="mt-6 border-t border-line pt-5">
          <label htmlFor="assistant-question" className="sr-only">Your question</label>
          <textarea
            id="assistant-question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            placeholder="Ask a college or career question..."
            rows={3}
            maxLength={2000}
            disabled={pending}
            className="w-full resize-y rounded-lg border border-line bg-card px-3 py-2.5 text-ink outline-none focus:border-accent disabled:opacity-60"
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-xs text-ink-muted">Clario guides your decision; it does not make it for you.</p>
            <Button type="submit" disabled={pending || !question.trim()}>
              {pending ? "Thinking..." : "Send"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
