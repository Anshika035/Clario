import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/db/server";
import {
  answerAssistantQuestion,
  AssistantServiceError,
  loadAssistantConversation,
} from "@/lib/services/assistant";

async function getAuthenticatedUser() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { error: NextResponse.json({ error: "Authentication is not configured." }, { status: 503 }) };
  }

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return { error: NextResponse.json({ error: "Please log in to use the assistant." }, { status: 401 }) };
  }

  return { user: data.user };
}

export async function GET() {
  const auth = await getAuthenticatedUser();
  if ("error" in auth) {
    return auth.error;
  }

  try {
    return NextResponse.json(await loadAssistantConversation(auth.user.id));
  } catch (error) {
    if (error instanceof AssistantServiceError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "The assistant conversation could not be loaded." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser();
  if ("error" in auth) {
    return auth.error;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a valid JSON request." }, { status: 400 });
  }

  const content =
    typeof body === "object" && body !== null && "content" in body && typeof body.content === "string"
      ? body.content
      : "";
  const opportunityId =
    typeof body === "object" && body !== null && "opportunityId" in body && typeof body.opportunityId === "string"
      ? body.opportunityId
      : undefined;

  try {
    return NextResponse.json(await answerAssistantQuestion(auth.user.id, content, opportunityId), { status: 201 });
  } catch (error) {
    if (error instanceof AssistantServiceError) {
      const status = error.code === "validation" ? 400 : error.code === "provider" ? 502 : 500;
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json({ error: "The assistant could not answer right now." }, { status: 500 });
  }
}
