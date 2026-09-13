import { createServiceRoleClient } from "@/lib/db/server";
import type { AssistantConversation, AssistantMessage } from "@/types/assistant";

function getDatabaseClient() {
  const client = createServiceRoleClient();
  if (!client) {
    throw new Error("Database is not configured.");
  }
  return client;
}

function mapMessage(message: {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}): AssistantMessage {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    createdAt: message.created_at,
  };
}

export async function getAssistantConversation(userId: string): Promise<AssistantConversation> {
  const client = getDatabaseClient();
  const { data: thread, error: threadError } = await client
    .from("assistant_threads")
    .select("id")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (threadError) {
    throw new Error("Could not load the assistant conversation.");
  }
  if (!thread) {
    return { threadId: null, messages: [] };
  }

  const { data: messages, error: messagesError } = await client
    .from("assistant_messages")
    .select("id, role, content, created_at")
    .eq("thread_id", thread.id)
    .order("created_at", { ascending: true });

  if (messagesError) {
    throw new Error("Could not load the assistant conversation.");
  }

  return {
    threadId: thread.id,
    messages: (messages ?? []).map(mapMessage),
  };
}

async function getOrCreateThread(userId: string) {
  const client = getDatabaseClient();
  const { data: existing, error: existingError } = await client
    .from("assistant_threads")
    .select("id")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existingError) {
    throw new Error("Could not load the assistant conversation.");
  }
  if (existing) {
    return existing.id;
  }

  const { data: created, error: createError } = await client
    .from("assistant_threads")
    .insert({ user_id: userId })
    .select("id")
    .single();

  if (createError || !created) {
    throw new Error("Could not create the assistant conversation.");
  }

  return created.id;
}

export async function saveAssistantTurn(
  userId: string,
  userContent: string,
  assistantContent: string,
) {
  const client = getDatabaseClient();
  const threadId = await getOrCreateThread(userId);
  const { data, error } = await client
    .from("assistant_messages")
    .insert([
      { thread_id: threadId, role: "user", content: userContent },
      { thread_id: threadId, role: "assistant", content: assistantContent },
    ])
    .select("id, role, content, created_at");

  if (error || !data) {
    throw new Error("Could not save the assistant response.");
  }

  return {
    threadId,
    messages: data.map(mapMessage),
  };
}
