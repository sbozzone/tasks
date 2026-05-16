import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const familyId = request.headers.get("x-family-id");
  const weekStart = request.nextUrl.searchParams.get("weekStart");

  if (!familyId || !weekStart) {
    return NextResponse.json(
      { error: "Missing family ID or weekStart" },
      { status: 400 }
    );
  }

  const supabase = createServerClient();

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekEndStr = weekEnd.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("meal_plans")
    .select("*, dish:dishes(*)")
    .eq("family_id", familyId)
    .gte("meal_date", weekStart)
    .lte("meal_date", weekEndStr)
    .order("meal_date")
    .order("position");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const familyId = request.headers.get("x-family-id");
  if (!familyId) {
    return NextResponse.json({ error: "Missing family ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("meal_plans")
      .insert({
        family_id: familyId,
        dish_id: body.dish_id || null,
        meal_date: body.meal_date,
        custom_name: body.custom_name || null,
        position: body.position || 0,
      })
      .select("*, dish:dishes(*)")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
