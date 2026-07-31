import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { Role } from "@/types/roles";

const RULES: { prefix: string; roles: Role[] }[] = [
  { prefix: "/superadmin", roles: ["superadmin"] },
  { prefix: "/api/superadmin", roles: ["superadmin"] },

  { prefix: "/admin", roles: ["admin", "superadmin"] },
  { prefix: "/api/admin", roles: ["admin", "superadmin"] },

  { prefix: "/org", roles: ["org"] },
  { prefix: "/api/org", roles: ["org"] },

  { prefix: "/dashboard", roles: ["user", "org", "admin", "superadmin"] },
];

function matchRule(pathname: string) {
  return RULES.find((r) => pathname.startsWith(r.prefix));
}

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role as Role | undefined;
    const rule = matchRule(pathname);

    if (!rule) return NextResponse.next();

    const allowed = !!role && rule.roles.includes(role);
    if (allowed) return NextResponse.next();

    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/", req.url));
  },
  {
    callbacks: {
      // withAuth's own gate: is there a token at all?
      // Return true here and let the function above decide role-based
      // access, otherwise withAuth short-circuits unauthenticated
      // requests to /login before our JSON-vs-redirect logic can run.
      authorized: ({ token, req }) => {
        const rule = matchRule(req.nextUrl.pathname);
        if (!rule) return true; // unprotected route, no token required
        return !!token; // protected route: just require *some* session here
      },
    },
    pages: { signIn: "/login" },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/org/:path*",
    "/admin/:path*",
    "/superadmin/:path*",
    "/api/org/:path*",
    "/api/admin/:path*",
    "/api/superadmin/:path*",
  ],
};