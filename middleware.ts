import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";

// Define protected routes
const protectedRoutes = [
  "/dashboard",
  "/upload",
  "/feed",
  "/analytics",
  "/live",
  "/ai-studio",
  "/following",
  "/profile",
];

// Define public routes that authenticated users shouldn't access
const authRoutes = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  // const { pathname } = request.nextUrl
  // // Check if the route is protected
  // const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  // // Check if the route is an auth route
  // const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))
  // // Get user from request
  // const user = await getUserFromRequest(request)
  // // Redirect unauthenticated users from protected routes
  // if (isProtectedRoute && !user) {
  //   return NextResponse.redirect(new URL("/login", request.url))
  // }
  // // Redirect authenticated users from auth routes
  // if (isAuthRoute && user) {
  //   return NextResponse.redirect(new URL("/dashboard", request.url))
  // }
  // return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
