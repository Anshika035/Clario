import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/ui/container";

export function SiteHeader() {
  return (
    <header className="border-b border-line/80 bg-paper/90 backdrop-blur-sm">
      <Container className="flex h-16 items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-ink-muted hover:text-ink"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-accent px-3 py-2 font-medium text-white hover:bg-accent-dark"
          >
            Get started
          </Link>
        </nav>
      </Container>
    </header>
  );
}
