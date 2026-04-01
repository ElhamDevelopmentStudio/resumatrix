import Image from "next/image"

import { LoginCard } from "@/app/_components/login-card"
import { Footer } from "@/components/layout/footer"
import { Logo } from "@/components/logo"

const workspacePreviewImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBpMKEOTB_JIQ8D1dm7VMY9yXEgwwyBSP8A-NSdPR0m56qCJqW6Iw1hKGfvAmWDIxF4Mm60xCLxm870d1MaHrJSv_Gl1Fz2FSu2hnZEcJvl9QLknSMHECtVQPZlNzD09dgq3lcycn1UxzlrTYw1HKZKNWuN3f6Fji6gmXlgx3X1m4NoB_BUo_qFkRchlPwMnLjekP1USzD7_K7lSGGbr8JcEZhwc4Me2S-dGJsrZ6z6SQMV87b9Ejsv7B7dZRw6pp88EdCdJYEwP1A"

export function LoginScreen({
  isAuthenticated,
}: {
  isAuthenticated: boolean
}) {
  return (
    <div className="relative grid min-h-screen grid-rows-[auto,minmax(0,1fr),auto] overflow-hidden bg-background lg:h-screen">
      <header className="relative z-50 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 md:px-8 md:py-7 xl:py-8">
        <Logo />
      </header>

      <main className="relative flex min-h-0 items-center justify-center px-6 py-4 md:px-8 md:py-5 xl:py-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-[10%] -right-[10%] h-[500px] w-[500px] rounded-full bg-primary/5 blur-[100px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-[10%] -left-[10%] h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]"
        />

        <div className="z-10 w-full max-w-[480px] max-h-full animate-in fade-in-0 slide-in-from-bottom-5 duration-700 ease-out">
          <LoginCard isAuthenticated={isAuthenticated} />
        </div>
      </main>

      <Footer
        copyText="Precision Engineering for professionals."
        links={["Privacy Policy", "Terms of Service", "Security"]}
        className="gap-3 border-t border-outline-variant/10 bg-transparent px-6 py-5 md:flex-row md:gap-4 md:px-8 md:py-6 xl:py-7"
        copyClassName="text-xs font-medium text-outline"
        linkClassName="text-xs font-medium text-outline transition-all hover:underline decoration-primary/50"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-1/2 right-0 hidden h-[800px] w-[600px] -translate-y-1/2 rotate-6 opacity-40 xl:block"
      >
        <div className="relative h-full w-full overflow-hidden rounded-[2rem] border-8 border-card shadow-2xl">
          <Image
            src={workspacePreviewImage}
            alt=""
            fill
            sizes="600px"
            className="object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
        </div>
      </div>
    </div>
  )
}
