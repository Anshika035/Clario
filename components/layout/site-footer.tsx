import Link from "next/link";
import { Container } from "@/components/ui/container";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-paper">
      <Container className="flex flex-col gap-3 py-8 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
        <p>Clario helps students decide. It does not decide for them.</p>
        <p>
          <Link href="/analyze" className="text-ink hover:underline">
            Open the app
          </Link>
        </p>
      </Container>
    </footer>
  );
}
