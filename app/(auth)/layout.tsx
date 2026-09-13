import Link from "next/link";
import { type ReactNode } from "react";
import { Logo } from "@/components/brand/logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 w-full max-w-md items-center justify-between px-4">
          <Logo />
          <Link href="/" className="text-sm text-ink-muted hover:text-ink">
            Home
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 py-12">
        {children}
      </main>
    </div>
  );
}
