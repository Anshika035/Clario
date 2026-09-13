import { Suspense } from "react";
import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { ConfigBanner } from "@/components/auth/config-banner";
import { Card } from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata = {
  title: "Sign up",
};

export default function SignupPage() {
  const configured = isSupabaseConfigured();

  return (
    <div className="w-full max-w-md space-y-4">
      <div>
        <h1 className="font-display text-3xl">Join Clario</h1>
        <p className="mt-2 text-ink-muted">
          For students who want a second opinion — not another chatbot.
        </p>
      </div>
      <ConfigBanner />
      <Card>
        <Suspense fallback={<p className="text-sm text-ink-muted">Loading form…</p>}>
          <AuthForm mode="signup" configured={configured} />
        </Suspense>
      </Card>
      <p className="text-sm text-ink-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-accent hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
