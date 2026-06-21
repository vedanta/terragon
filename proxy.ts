import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "@/auth.config";

const { auth } = NextAuth(authConfig);

const PROTECTED = [
  "/dashboard",
  "/board",
  "/grooming",
  "/milestones",
  "/my-work",
  "/settings",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  if (isProtected && !req.auth) {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }
});

export const config = {
  // Run on everything except API, Next internals, and static assets.
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
