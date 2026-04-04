import "server-only"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { NextResponse } from "next/server"

import { buildApiError } from "@/lib/career-data/http"

import { AUTH_SESSION_COOKIE, type AuthSession, verifySessionToken } from "./session"

export async function getRequestSession(): Promise<AuthSession | null> {
  const token = (await cookies()).get(AUTH_SESSION_COOKIE)?.value
  return verifySessionToken(token)
}

export async function requireRequestSession(redirectPath = "/"): Promise<AuthSession> {
  const session = await getRequestSession()

  if (!session) {
    redirect(redirectPath)
  }

  return session
}

export function buildAuthRequiredResponse() {
  return NextResponse.json(
    buildApiError("Sign in to access this resource.", "AUTH_REQUIRED"),
    { status: 401 }
  )
}

type DefaultRouteContext = {
  params: Promise<Record<string, string | string[] | undefined>>
}

type AuthenticatedRouteHandler<TContext = DefaultRouteContext> = (
  request: Request,
  context: TContext,
  session: AuthSession
) => Promise<Response>

export function withApiSession<TContext = DefaultRouteContext>(
  handler: AuthenticatedRouteHandler<TContext>
) {
  return async (request: Request, context: TContext) => {
    const session = await getRequestSession()

    if (!session) {
      return buildAuthRequiredResponse()
    }

    return handler(request, context, session)
  }
}

export async function clearRequestSession() {
  const cookieStore = await cookies()
  cookieStore.delete(AUTH_SESSION_COOKIE)
}
