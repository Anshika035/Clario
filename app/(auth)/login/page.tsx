import { Suspense } from "react";
import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { ConfigBanner } from "@/components/auth/config-banner";
import { Card } from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata = {
  title: "Log in",
};

export default function LoginPage() {
  const configured = isSupabaseConfigured();

  return (
    <div className="w-full max-w-md space-y-4">
      <div>
        <h1 className="font-display text-3xl">Welcome back</h1>
        <p className="mt-2 text-ink-muted">
          Log in to analyze opportunities and keep your profile.
        </p>
      </div>
      <ConfigBanner />
      <Card>
        <Suspense fallback={<p className="text-sm text-ink-muted">Loading form…</p>}>
          <AuthForm mode="login" configured={configured} />
        </Suspense>
      </Card>
      <p className="text-sm text-ink-muted">
        New here?{" "}
        <Link href="/signup" className="font-medium text-accent hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
