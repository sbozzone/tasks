import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { nanoid } from "nanoid";

export async function POST(request: Request) {
  try {
    const { name } = await request.json();

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Family name is required" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const shareCode = nanoid(8);

    const { data, error } = await supabase
      .from("families")
      .insert({ name: name.trim(), share_code: shareCode })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const response = NextResponse.json({
      id: data.id,
      name: data.name,
      share_code: data.share_code,
    });

    response.cookies.set("familyCode", data.share_code, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
