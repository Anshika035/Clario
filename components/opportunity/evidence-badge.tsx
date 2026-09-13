import type { EvidenceKind } from "@/types/common";

const labels: Record<EvidenceKind, string> = {
  user_provided: "You provided",
  ai_interpretation: "AI reading",
  unverified: "Unverified",
};

const styles: Record<EvidenceKind, string> = {
  user_provided: "bg-provided/10 text-provided",
  ai_interpretation: "bg-accent-soft text-accent-dark",
  unverified: "bg-warn-soft text-warn",
};

export function EvidenceBadge({ kind, compact = false }: { kind: EvidenceKind; compact?: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full border border-current/15 ${compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs"} font-medium ${styles[kind]}`}
    >
      {labels[kind]}
    </span>
  );
}
