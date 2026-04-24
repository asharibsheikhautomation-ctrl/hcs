import { NextResponse, type NextRequest } from "next/server";
import {
  buildAdminRedirectPath,
  isAdminRequestAuthenticated,
} from "@/lib/admin-auth";

export function proxy(request: NextRequest) {
  if (isAdminRequestAuthenticated(request)) {
    return NextResponse.next();
  }

  const loginUrl = new URL(
    buildAdminRedirectPath(
      request.nextUrl.pathname,
      request.nextUrl.search,
    ),
    request.url,
  );

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
