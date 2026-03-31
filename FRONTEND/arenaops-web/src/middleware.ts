import { NextRequest, NextResponse } from "next/server";

const ADMIN_ROLE = "Admin";
const ROLE_KEYS = [
  "roles",
  "role",
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
];

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), "=");
    const json = atob(padded);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function extractRoles(payload: Record<string, unknown> | null): string[] {
  if (!payload) return [];

  const roles = new Set<string>();

  for (const key of ROLE_KEYS) {
    const value = payload[key];
    if (typeof value === "string") {
      roles.add(value);
      continue;
    }

    if (Array.isArray(value)) {
      for (const entry of value) {
        if (typeof entry === "string") {
          roles.add(entry);
        }
      }
    }
  }

  return [...roles];
}

function isAdminToken(token: string | undefined): boolean {
  if (!token) return false;
  const payload = decodeJwtPayload(token);
  const roles = extractRoles(payload);
  return roles.includes(ADMIN_ROLE);
}

function hasAnyRole(token: string | undefined, requiredRoles: string[]): boolean {
  if (!token) return false;
  const payload = decodeJwtPayload(token);
  const roles = extractRoles(payload);
  return requiredRoles.some((role) => roles.includes(role));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("accessToken")?.value;
  const isAdmin = isAdminToken(token);
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const isManagerRoute = pathname === "/manager" || pathname.startsWith("/manager/");
  const isEventManagerRoute =
    pathname === "/event-manager" || pathname.startsWith("/event-manager/");
  const isAuthLanding = pathname === "/" || pathname === "/login";

  if (isAdminRoute && !isAdmin) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isManagerRoute && !hasAnyRole(token, ["StadiumOwner", "Admin"])) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isEventManagerRoute && !hasAnyRole(token, ["EventManager", "Admin"])) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isAuthLanding && isAdmin) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  if (pathname === "/admin" && isAdmin) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/admin/:path*",
    "/manager",
    "/manager/:path*",
    "/event-manager",
    "/event-manager/:path*",
  ],
};
