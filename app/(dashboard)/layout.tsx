import type { ReactNode } from "react"

import { AppConvexProvider } from "@/components/convex-provider"
import { Footer } from "@/components/layout/footer"
import { requireRequestSession } from "@/lib/auth/server"

import { DashboardHeader } from "./dashboard/_components/dashboard-header"
import { DashboardSidebar } from "./dashboard/_components/dashboard-sidebar"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await requireRequestSession()

  return (
    <AppConvexProvider>
      <div className="min-h-screen bg-background text-on-surface lg:flex">
        <DashboardSidebar />
        <div className="flex min-h-screen flex-1 flex-col lg:ml-64">
          <DashboardHeader username={session.username} />
          {children}
          <Footer
            title="Resumatrix"
            copyText="Precision Engineering for Professionals."
            className="mt-auto border-t border-outline-variant/60 bg-surface-muted px-6 py-12 md:flex-row md:px-8 xl:px-12"
            titleClassName="font-headline text-lg font-bold text-on-surface"
            copyClassName="text-xs font-medium text-on-surface-variant/60"
            linksClassName="gap-8"
            linkClassName="text-[11px] font-bold tracking-[0.2em] text-on-surface-variant/50 uppercase transition-colors hover:text-primary"
          />
        </div>
      </div>
    </AppConvexProvider>
  )
}
