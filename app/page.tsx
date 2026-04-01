import type { Metadata } from "next"
import { cookies } from "next/headers"

import { LoginScreen } from "@/app/_components/login-screen"
import { AUTH_SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session"

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to access your Resumatrix workspace.",
}

export default async function Home() {
  const sessionCookie = (await cookies()).get(AUTH_SESSION_COOKIE)?.value
  const session = sessionCookie ? verifySessionToken(sessionCookie) : null

  return <LoginScreen isAuthenticated={Boolean(session)} />
}
