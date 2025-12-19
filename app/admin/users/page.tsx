import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { UsersTable } from "@/components/admin/users-table"

export default function AdminUsersPage() {
  return (
    <DashboardLayout role="admin" userName="Admin">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Users</h2>
          <p className="text-muted-foreground">Manage system users and their roles</p>
        </div>
        <UsersTable />
      </div>
    </DashboardLayout>
  )
}
