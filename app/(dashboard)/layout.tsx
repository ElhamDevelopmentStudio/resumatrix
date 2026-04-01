import type { ReactNode } from "react"

import { Footer } from "@/components/layout/footer"

import { DashboardHeader } from "./dashboard/_components/dashboard-header"
import { DashboardSidebar } from "./dashboard/_components/dashboard-sidebar"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d] lg:flex">
      <DashboardSidebar />
      <div className="flex min-h-screen flex-1 flex-col lg:ml-64">
        <DashboardHeader />
        {children}
        <Footer
          title="Resumatrix"
          copyText="Precision Engineering for Professionals."
          className="mt-auto border-t border-[#c5c5d4]/20 bg-[#f1f3f5] px-6 py-12 md:flex-row md:px-8 xl:px-12"
          titleClassName="font-headline text-lg font-bold text-[#191c1d]"
          copyClassName="text-xs font-medium text-[#454652]/60"
          linksClassName="gap-8"
          linkClassName="text-[11px] font-bold tracking-[0.2em] text-[#454652]/50 uppercase transition-colors hover:text-[#002fbb]"
        />
      </div>
    </div>
  )
}
