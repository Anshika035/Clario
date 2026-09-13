export type PublicSupabaseEnv = {
  url: string;
  anonKey: string;
};

function isPlaceholder(value: string) {
  const lowered = value.toLowerCase();
  return (
    lowered.includes("your-project") ||
    lowered.includes("your-anon") ||
    lowered.includes("your-service-role") ||
    lowered.includes("example")
  );
}

export function getPublicSupabaseEnv(): PublicSupabaseEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    return null;
  }

  if (isPlaceholder(url) || isPlaceholder(anonKey)) {
    return null;
  }

  return { url, anonKey };
}

export function isSupabaseConfigured() {
  return getPublicSupabaseEnv() !== null;
}

export function getServiceRoleKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key || isPlaceholder(key)) {
    return null;
  }
  return key;
}

export function getOpenAiKey() {
  const key = process.env.OPENAI_API_KEY?.trim();
  return key || null;
}
