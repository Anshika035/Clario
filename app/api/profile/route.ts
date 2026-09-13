import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/db/server";
import { saveProfileForUser } from "@/lib/db/profile";
import { profileSchema } from "@/lib/validation/profile";

export async function PUT(request: Request) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Authentication is not configured." }, { status: 503 });
  }

  const { data, error: authError } = await supabase.auth.getUser();
  if (authError || !data.user) {
    return NextResponse.json({ error: "Please log in to update your profile." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a valid JSON request." }, { status: 400 });
  }

  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Check the profile details and try again.", fields: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(await saveProfileForUser(data.user.id, parsed.data));
  } catch {
    return NextResponse.json({ error: "Could not save the student profile." }, { status: 500 });
  }
}
