import type { ReactNode } from "react"

import { Header } from "@/components/layout/Header"
import { Sidebar } from "@/components/layout/Sidebar"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d] lg:flex">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col lg:ml-64">
        <Header />
        {children}
      </div>
    </div>
  )
}
