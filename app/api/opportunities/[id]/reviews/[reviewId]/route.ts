import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/db/server";
import { deleteOpportunityReview, updateOpportunityReview } from "@/lib/db/reviews";
import { seniorReviewSchema } from "@/lib/validation/review";

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string; reviewId: string }> },
) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Authentication is not configured." }, { status: 503 });
  }

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return NextResponse.json({ error: "Please log in to delete your review." }, { status: 401 });
  }

  const { id, reviewId } = await params;
  try {
    const deleted = await deleteOpportunityReview(data.user.id, id, reviewId);
    if (!deleted) {
      return NextResponse.json({ error: "Review not found." }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (deleteError) {
    return NextResponse.json(
      { error: deleteError instanceof Error ? deleteError.message : "Could not delete your review." },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; reviewId: string }> },
) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Authentication is not configured." }, { status: 503 });
  }

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return NextResponse.json({ error: "Please log in to edit your review." }, { status: 401 });
  }

  const { id, reviewId } = await params;
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
    const review = await updateOpportunityReview(data.user.id, { ...parsed.data, reviewId });
    return NextResponse.json(review);
  } catch (updateError) {
    const message = updateError instanceof Error ? updateError.message : "Could not update your review.";
    return NextResponse.json({ error: message }, { status: message === "Review not found." ? 404 : 500 });
  }
}
