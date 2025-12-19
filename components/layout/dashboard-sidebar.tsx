"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation" // Removed useSearchParams
import {
  LayoutDashboard,
  Users,
  Building2,
  Settings,
  UserCircle,
  DollarSign,
  FileText,
  Upload,
  BarChart3,
  Briefcase,
  Receipt,
} from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: any
  // section?: string; // Removed optional section property
}

const navItems: Record<string, NavItem[]> = {
  admin: [
    { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { title: "System Users", href: "/admin/users", icon: Users },
    { title: "Staff", href: "/admin/staff", icon: Users },
    { title: "Positions", href: "/admin/positions", icon: Briefcase },
    { title: "Allowances", href: "/admin/allowances", icon: FileText },
    { title: "Deductions", href: "/admin/deductions", icon: FileText },
    { title: "Salary Structure", href: "/admin/salary-structure", icon: DollarSign },
    { title: "Payslips", href: "/admin/payslips", icon: Receipt },
    { title: "Payroll Runs", href: "/admin/payroll-runs", icon: BarChart3 },
    { title: "Reports", href: "/admin/reports", icon: BarChart3 },
    { title: "System Settings", href: "/admin/settings", icon: Settings },
  ],
  hr: [
    { title: "Dashboard", href: "/hr", icon: LayoutDashboard },
    { title: "Staff", href: "/hr/staff", icon: Users },
    { title: "Positions", href: "/hr/positions", icon: Briefcase },
    { title: "Allowances", href: "/hr/allowances", icon: FileText },
    { title: "Deductions", href: "/hr/deductions", icon: FileText },
    { title: "Salary Structure", href: "/hr/salary", icon: DollarSign },
  ],
  payroll: [
    { title: "Dashboard", href: "/payroll", icon: LayoutDashboard },
    { title: "Staff", href: "/payroll/staff", icon: Users },
    { title: "Salary Structure", href: "/payroll/salary", icon: DollarSign },
    { title: "Allowances", href: "/payroll/allowances", icon: FileText },
    { title: "Deductions", href: "/payroll/deductions", icon: FileText },
    { title: "Payslips", href: "/payroll/payslips", icon: Receipt },
    { title: "Payroll Runs", href: "/payroll/runs", icon: BarChart3 },
    { title: "Reports", href: "/payroll/reports", icon: BarChart3 },
  ],
  staff: [
    { title: "Dashboard", href: "/staff", icon: LayoutDashboard },
    { title: "My Profile", href: "/staff/profile", icon: UserCircle },
    { title: "My Payslips", href: "/staff/payslips", icon: Receipt },
  ],
}

interface DashboardSidebarProps {
  role: "admin" | "hr" | "payroll" | "staff"
}

export function DashboardSidebar({ role }: DashboardSidebarProps) {
  const pathname = usePathname()
  // const searchParams = useSearchParams() // Removed useSearchParams
  // const currentSection = searchParams.get('section') || 'dashboard' // Removed currentSection

  const items = navItems[role] || []

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 border-r bg-background md:block">
      <nav className="flex flex-col gap-1 p-4">
        {items.map((item) => {
          const Icon = item.icon
          // Adjusted isActive logic to directly compare pathname with item.href
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
