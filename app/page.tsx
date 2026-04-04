import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { LoginScreen } from "@/app/_components/login-screen"
import { getRequestSession } from "@/lib/auth/server"

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to access your Resumatrix workspace.",
}

export default async function Home() {
  const session = await getRequestSession()

  if (session) {
    redirect("/dashboard")
  }

  return <LoginScreen isAuthenticated={false} />
}
