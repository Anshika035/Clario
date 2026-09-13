"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/brand/logo";
import { createBrowserSupabaseClient } from "@/lib/db/client";
import { appNav } from "@/lib/navigation";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signOut() {
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }

    setPending(true);
    setError(null);
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setError(signOutError.message);
      setPending(false);
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <div className="px-3">
      <button
        type="button"
        onClick={signOut}
        disabled={pending}
        className="text-sm font-medium text-ink-muted hover:text-ink disabled:opacity-60"
      >
        {pending ? "Signing out…" : "Sign out"}
      </button>
      {error ? <p className="mt-2 text-xs text-warn">{error}</p> : null}
    </div>
  );
}

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-line bg-card px-4 py-5 lg:flex">
      <Logo href="/" />
      <nav className="mt-8 flex flex-1 flex-col gap-1">
        <Link
          href="/"
          className={`rounded-xl px-3 py-2.5 transition-colors ${
            pathname === "/" ? "bg-accent-soft text-accent-dark" : "text-ink-muted hover:bg-paper hover:text-ink"
          }`}
        >
          <span className="block text-sm font-medium">Home</span>
          <span className="block text-xs opacity-80">Your Clario dashboard</span>
        </Link>
        {appNav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-xl px-3 py-2.5 transition-colors ${
                active ? "bg-accent-soft text-accent-dark" : "text-ink-muted hover:bg-paper hover:text-ink"
              }`}
            >
              <span className="block text-sm font-medium">{item.label}</span>
              <span className="block text-xs opacity-80">{item.description}</span>
            </Link>
          );
        })}
      </nav>
      <div className="space-y-3">
        <ThemeToggle />
        <span className="block px-3 text-xs text-ink-muted">AI assists. Seniors advise. You decide.</span>
        <SignOutButton />
      </div>
    </aside>
  );
}

export function AppMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm lg:hidden">
      <ul className="grid grid-cols-6">
        {[{ href: "/", label: "Home" }, ...appNav].map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex flex-col items-center px-1 py-2 text-[11px] font-medium transition-colors ${
                  active ? "text-accent-dark" : "text-ink-muted"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function AppTopBar() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-line bg-paper/95 px-4 lg:hidden">
      <Logo href="/" />
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Link href="/profile" className="text-sm font-medium text-ink-muted hover:text-ink">
          Profile
        </Link>
        <SignOutButton />
      </div>
    </header>
  );
}
