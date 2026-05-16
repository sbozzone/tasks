import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    const familyCode = request.cookies.get("familyCode")?.value;
    if (familyCode) {
      return NextResponse.redirect(new URL(`/${familyCode}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
