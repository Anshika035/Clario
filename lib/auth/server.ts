import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/db/server";
import { isSupabaseConfigured } from "@/lib/env";

export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return null;
  }

  return data.user;
}

export async function requireUser(nextPath?: string) {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const user = await getCurrentUser();
  if (!user) {
    const login = nextPath
      ? `/login?next=${encodeURIComponent(nextPath)}`
      : "/login";
    redirect(login);
  }

  return user;
}
