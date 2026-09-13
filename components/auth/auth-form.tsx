"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { createBrowserSupabaseClient } from "@/lib/db/client";
import { authCredentialsSchema } from "@/lib/validation/auth";

type AuthMode = "login" | "signup";

export function AuthForm({
  mode,
  configured,
}: {
  mode: AuthMode;
  configured: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    if (!configured) {
      setFormError(
        "Supabase environment variables are missing. Add them to .env.local, then restart the dev server.",
      );
      return;
    }

    const parsed = authCredentialsSchema.safeParse({ email, password });
    if (!parsed.success) {
      const nextErrors: { email?: string; password?: string } = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === "email" || key === "password") {
          nextErrors[key] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      return;
    }

    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setFormError("Supabase is not configured.");
      return;
    }

    setPending(true);
    const { error } =
      mode === "login"
        ? await supabase.auth.signInWithPassword(parsed.data)
        : await supabase.auth.signUp(parsed.data);
    setPending(false);

    if (error) {
      setFormError(error.message);
      return;
    }

    router.push(nextPath.startsWith("/") ? nextPath : "/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <TextField
        label="College email"
        name="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={fieldErrors.email}
        disabled={!configured || pending}
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        autoComplete={mode === "login" ? "current-password" : "new-password"}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={fieldErrors.password}
        hint={mode === "signup" ? "At least 8 characters." : undefined}
        disabled={!configured || pending}
      />
      {formError ? <p className="text-sm text-warn">{formError}</p> : null}
      <Button type="submit" className="w-full" disabled={!configured || pending}>
        {pending
          ? "Please wait…"
          : mode === "login"
            ? "Log in"
            : "Create account"}
      </Button>
    </form>
  );
}
