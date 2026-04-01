import Image from "next/image"

import { LoginCard } from "@/app/_components/login-card"
import { Logo } from "@/components/logo"

const footerLinks = ["Privacy Policy", "Terms of Service", "Security"]
const workspacePreviewImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBpMKEOTB_JIQ8D1dm7VMY9yXEgwwyBSP8A-NSdPR0m56qCJqW6Iw1hKGfvAmWDIxF4Mm60xCLxm870d1MaHrJSv_Gl1Fz2FSu2hnZEcJvl9QLknSMHECtVQPZlNzD09dgq3lcycn1UxzlrTYw1HKZKNWuN3f6Fji6gmXlgx3X1m4NoB_BUo_qFkRchlPwMnLjekP1USzD7_K7lSGGbr8JcEZhwc4Me2S-dGJsrZ6z6SQMV87b9Ejsv7B7dZRw6pp88EdCdJYEwP1A"

export function LoginScreen({
  isAuthenticated,
}: {
  isAuthenticated: boolean
}) {
  const currentYear = new Date().getFullYear()

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <header className="fixed top-0 left-1/2 z-50 flex w-full max-w-7xl -translate-x-1/2 items-center justify-between px-8 py-8">
        <Logo />
      </header>

      <main className="relative flex flex-1 items-center justify-center p-6 pt-32 pb-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-[10%] -right-[10%] h-[500px] w-[500px] rounded-full bg-primary/5 blur-[100px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-[10%] -left-[10%] h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]"
        />

        <div className="z-10 w-full max-w-[480px] animate-in fade-in-0 slide-in-from-bottom-5 duration-700 ease-out">
          <LoginCard isAuthenticated={isAuthenticated} />
        </div>
      </main>

      <footer className="flex w-full flex-col items-center justify-between gap-4 border-t border-outline-variant/10 bg-transparent px-8 py-12 md:flex-row">
        <div className="text-xs font-medium text-outline">
          © {currentYear} Resumatrix. Precision Engineering for professionals.
        </div>
        <div className="flex gap-8">
          {footerLinks.map((link) => (
            <a
              key={link}
              href="#"
              className="text-xs font-medium text-outline transition-all hover:underline decoration-primary/50"
            >
              {link}
            </a>
          ))}
        </div>
      </footer>

      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-1/2 -right-64 hidden h-[800px] w-[600px] -translate-y-1/2 rotate-6 opacity-40 xl:block"
      >
        <div className="relative h-full w-full overflow-hidden rounded-[2rem] border-8 border-white shadow-2xl">
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
