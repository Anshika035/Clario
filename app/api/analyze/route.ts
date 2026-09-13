import { NextResponse } from "next/server";
import { analyzeAndSaveOpportunity } from "@/lib/services/analysis";
import { createServerSupabaseClient } from "@/lib/db/server";
import {
  normalizeOpportunityInput,
  opportunityInputSchema,
} from "@/lib/validation/opportunity";
import { AnalysisServiceError } from "@/lib/services/analysis";

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Authentication is not configured." },
      { status: 503 },
    );
  }

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return NextResponse.json({ error: "Please log in to analyze an opportunity." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a valid JSON request." }, { status: 400 });
  }

  const parsed = opportunityInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Check the opportunity details and try again.", fields: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const result = await analyzeAndSaveOpportunity(
      data.user.id,
      normalizeOpportunityInput(parsed.data),
    );
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof AnalysisServiceError) {
      const status =
        error.code === "configuration"
          ? 503
          : error.code === "validation"
            ? 422
            : error.code === "database"
              ? 500
              : 502;
      return NextResponse.json({ error: error.message }, { status });
    }

    return NextResponse.json({ error: "The analysis could not be completed." }, { status: 500 });
  }
}
