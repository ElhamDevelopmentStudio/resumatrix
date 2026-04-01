import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import {
  AUTH_SESSION_COOKIE,
  AUTH_SESSION_MAX_AGE,
  buildLoginError,
  buildLoginSuccess,
  createSessionToken,
  getConfiguredCredentials,
  isValidCredentials,
  type LoginRequestBody,
} from "@/lib/auth/session"

export async function POST(request: Request) {
  let body: Partial<LoginRequestBody> | null = null

  try {
    body = (await request.json()) as Partial<LoginRequestBody>
  } catch {
    return NextResponse.json(
      buildLoginError("Enter a username and password.", "INVALID_REQUEST"),
      { status: 400 }
    )
  }

  const username = typeof body?.username === "string" ? body.username.trim() : ""
  const password = typeof body?.password === "string" ? body.password : ""

  if (!username || !password) {
    return NextResponse.json(
      buildLoginError("Enter a username and password.", "INVALID_REQUEST"),
      { status: 400 }
    )
  }

  const credentials = getConfiguredCredentials()

  if (!credentials) {
    return NextResponse.json(
      buildLoginError("Sign-in is not configured yet.", "AUTH_NOT_CONFIGURED"),
      { status: 500 }
    )
  }

  if (!isValidCredentials(username, password, credentials)) {
    return NextResponse.json(
      buildLoginError("Username or password is incorrect.", "AUTH_FAILED"),
      { status: 401 }
    )
  }

  let token = ""

  try {
    token = createSessionToken(username)
  } catch {
    return NextResponse.json(
      buildLoginError("Sign-in is not configured yet.", "AUTH_NOT_CONFIGURED"),
      { status: 500 }
    )
  }

  const cookieStore = await cookies()

  cookieStore.set(AUTH_SESSION_COOKIE, token, {
    httpOnly: true,
    maxAge: AUTH_SESSION_MAX_AGE,
    path: "/",
    priority: "high",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })

  return NextResponse.json(buildLoginSuccess(token))
}
