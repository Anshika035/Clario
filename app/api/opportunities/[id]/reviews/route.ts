import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/db/server";
import { createOpportunityReview, getOpportunityReviews } from "@/lib/db/reviews";
import { seniorReviewSchema } from "@/lib/validation/review";

async function getUser() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { response: NextResponse.json({ error: "Authentication is not configured." }, { status: 503 }) };
  }

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return { response: NextResponse.json({ error: "Please log in to view senior insights." }, { status: 401 }) };
  }

  return { user: data.user };
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getUser();
  if (auth.response) {
    return auth.response;
  }

  const { id } = await params;
  try {
    return NextResponse.json(await getOpportunityReviews(id));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load senior reviews." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getUser();
  if (auth.response) {
    return auth.response;
  }

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a valid JSON request." }, { status: 400 });
  }

  const parsed = seniorReviewSchema.safeParse({ ...(body as object), opportunityId: id });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Check the review details and try again.", fields: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const review = await createOpportunityReview(auth.user.id, parsed.data);
    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save your review.";
    const status = message.includes("already") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
