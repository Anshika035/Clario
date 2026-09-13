import { isSupabaseConfigured } from "@/lib/env";

export function ConfigBanner() {
  if (isSupabaseConfigured()) {
    return null;
  }

  return (
    <div className="rounded-xl border border-warn/30 bg-warn-soft px-4 py-3 text-sm text-ink">
      <p className="font-medium">Supabase is not configured yet</p>
      <p className="mt-1 text-ink-muted">
        Copy <code className="font-mono text-xs">.env.example</code> to{" "}
        <code className="font-mono text-xs">.env.local</code> and add{" "}
        <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
        <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
        Forms below will stay disabled until those values are set.
      </p>
    </div>
  );
}
