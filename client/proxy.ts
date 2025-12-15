import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read your session cookie
  const sessionCookie = request.cookies.get("arif-hasab.session_token")?.value;
  console.log("this is session cookie", sessionCookie);

  const isAuthenticated = !!sessionCookie;

  // Prevent logged-in users from accessing auth pages
  const protectedFromAuthRoutes =
    pathname === "/" || pathname.startsWith("/auth");
  if (isAuthenticated && protectedFromAuthRoutes) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // Protect private routes
  const privateRoutes = ["/home"];
  const isPrivateRoute = privateRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (!isAuthenticated && isPrivateRoute) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/auth/:path*",
    "/home/:path*",
  ],
};
