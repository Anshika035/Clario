import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex flex-col items-start gap-1">
      <span className="font-display text-xl font-semibold leading-none tracking-[-0.03em] text-ink">
        Clario
      </span>
      <span className="text-[10px] font-medium leading-none tracking-[0.04em] text-accent">
        See opportunities clearly.
      </span>
    </Link>
  );
}
