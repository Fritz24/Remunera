"use client"

import type { ReactNode } from "react"
import { DashboardSidebar } from "./dashboard-sidebar"
import { DashboardNavbar } from "./dashboard-navbar"

export type UserRole = "admin" | "hr" | "payroll" | "staff"

interface DashboardLayoutProps {
  children: ReactNode
  role: UserRole
  userName: string
}

export function DashboardLayout({ children, role, userName }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardNavbar userName={userName} />
      <div className="flex">
        <DashboardSidebar role={role} />
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
