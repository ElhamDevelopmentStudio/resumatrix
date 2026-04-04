import { NextResponse, type NextRequest } from "next/server"

import { buildApiError } from "@/lib/career-data/http"
import { AUTH_SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session"

const protectedAppPrefixes = [
  "/dashboard",
  "/career-data",
  "/profiles",
  "/cvs",
  "/cv-print",
  "/personal",
]

const protectedApiPrefixes = [
  "/api/contacts",
  "/api/cvs",
  "/api/education",
  "/api/experiences",
  "/api/personal",
  "/api/profiles",
  "/api/projects",
  "/api/skills",
  "/api/templates",
]

function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(AUTH_SESSION_COOKIE)?.value
  const session = verifySessionToken(token)

  if (pathname === "/") {
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    return NextResponse.next()
  }

  if (protectedApiPrefixes.some((prefix) => matchesPrefix(pathname, prefix))) {
    if (!session) {
      return NextResponse.json(
        buildApiError("Sign in to access this resource.", "AUTH_REQUIRED"),
        { status: 401 }
      )
    }

    return NextResponse.next()
  }

  if (protectedAppPrefixes.some((prefix) => matchesPrefix(pathname, prefix))) {
    if (!session) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/career-data/:path*",
    "/profiles/:path*",
    "/cvs/:path*",
    "/cv-print/:path*",
    "/personal",
    "/api/contacts/:path*",
    "/api/cvs/:path*",
    "/api/education/:path*",
    "/api/experiences/:path*",
    "/api/personal/:path*",
    "/api/profiles/:path*",
    "/api/projects/:path*",
    "/api/skills/:path*",
    "/api/templates/:path*",
  ],
}
