"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Briefcase, Settings, History, DollarSign, FileText } from "lucide-react"
import Link from "next/link"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import { formatRelativeTime } from "@/lib/utils/formatters"

export default function AdminDashboard() {
  const supabase = createClient()

  const { data: usersCount, error: usersCountError, isLoading: usersCountLoading } = useSWR(
    "admin_users_count",
    async () => {
      const { count, error } = await supabase.from("profiles").select("id", { count: "exact", head: true })
      if (error) throw error
      return count
    }
  )

  const { data: recentActivities, error: activitiesError, isLoading: activitiesLoading } = useSWR(
    `/api/payroll/activities`,
    async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch recent activities");
      }
      return response.json();
    }
  );

  if (usersCountError || activitiesError) {
    return <DashboardLayout role="admin" userName="Admin"><div>Error loading dashboard data.</div></DashboardLayout>
  }

  return (
    <DashboardLayout role="admin" userName="Admin"> 
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
          <p className="text-muted-foreground">Manage users and system settings</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2"> 
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usersCountLoading ? 'Loading...' : usersCount || 0}</div>
              <p className="text-xs text-muted-foreground">Total system users</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Online</div>
              <p className="text-xs text-muted-foreground">All systems operational</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2"> 
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><History className="h-5 w-5" /> Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activitiesLoading ? (
                  <div className="text-center text-muted-foreground">Loading recent activities...</div>
                ) : recentActivities?.length > 0 ? (
                  recentActivities.map((activity: any, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        {activity.type === "staff" && <Users className="h-4 w-4 text-primary" />}
                        {activity.type === "position" && <Briefcase className="h-4 w-4 text-primary" />}
                        {(activity.type === "allowance" || activity.type === "deduction" || activity.type === "payslip" || activity.type === "payslip_generated") && <FileText className="h-4 w-4 text-primary" />}
                        {activity.type === "payroll_run" && <DollarSign className="h-4 w-4 text-primary" />}
                        {activity.type === "staff_profile" && <Users className="h-4 w-4 text-primary" />}
                        {activity.type === "salary_structure" && <DollarSign className="h-4 w-4 text-primary" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatRelativeTime(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No recent activities.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href="/admin/users" className="block">
                  <div className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Manage System Users</p>
                      <p className="text-xs text-muted-foreground">Add or edit system users</p>
                    </div>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
