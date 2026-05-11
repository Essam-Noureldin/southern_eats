/**
 * WHAT: Edge middleware that guards every /admin route. Three outcomes:
 *       - ADMIN_PASSWORD env var unset → 404 (panel is disabled entirely)
 *       - Authorization header missing or wrong → 401 + WWW-Authenticate
 *       - Credentials match → request continues to the route handler
 * WHY:  Keeping the auth check in middleware means an unauth'd request
 *       never reaches the server component that lists locations. The
 *       404-when-unset default is a production safety net: a deploy
 *       that forgets to set the env var doesn't expose an open editor.
 * IF REMOVED: anyone on the internet can hit /admin and edit hours/phone.
 * COMMON MISTAKE: trusting `process.env.ADMIN_PASSWORD` via `lib/env.ts`
 *       in middleware. Edge runtime evaluates this file before Next's
 *       env loader has run our zod validation; reading process.env
 *       directly here is correct and intentional. Validation happens
 *       at server-component / API-route time via env.ts.
 */
import { NextResponse, type NextRequest } from "next/server";
import { checkAdminAuth } from "@/lib/admin-auth";

const REALM = 'Basic realm="Sams admin", charset="UTF-8"';

export function middleware(req: NextRequest): Response {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    // Panel disabled — pretend the route doesn't exist. Don't 401 here:
    // 401 reveals "the panel is real, you just don't have creds", which
    // tips off attackers that this codebase is worth poking at.
    return new NextResponse("Not Found", { status: 404 });
  }

  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const result = checkAdminAuth(
    req.headers.get("authorization"),
    adminUsername,
    adminPassword,
  );
  if (result === "ok") {
    return NextResponse.next();
  }
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": REALM },
  });
}

export const config = {
  matcher: "/admin/:path*",
};
