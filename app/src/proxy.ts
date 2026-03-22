import { NextRequest, NextResponse } from "next/server";
import { betterFetch } from "@better-fetch/fetch";
import type { auth } from "@/lib/auth";

type Session = typeof auth.$Infer.Session;

const publicPrefixes = ["/", "/login", "/register", "/services", "/requests", "/api"];

function isPublicRoute(req: NextRequest): boolean {
  const { pathname } = req.nextUrl;
  return publicPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );
}

export async function proxy(req: NextRequest) {
  if (isPublicRoute(req)) return NextResponse.next();

  const { data: session, error } = await betterFetch<Session>("/api/auth/get-session", {
    baseURL: req.nextUrl.origin,
    headers: { cookie: req.headers.get("cookie") ?? "" },
  });

  console.log("[proxy] session:", JSON.stringify(session), "error:", JSON.stringify(error), "cookies:", req.headers.get("cookie")?.slice(0, 100));

  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
