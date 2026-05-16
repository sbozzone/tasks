import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code || typeof code !== "string" || code.trim().length === 0) {
      return NextResponse.json(
        { error: "Family code is required" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("families")
      .select("id, name, share_code")
      .eq("share_code", code.trim())
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Family not found. Check your code and try again." },
        { status: 404 }
      );
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
