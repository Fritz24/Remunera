import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StaffTypesTable } from "@/components/admin/staff-types-table"

export default function AdminStaffTypesPage() {
  return (
    <DashboardLayout role="admin" userName="Admin User">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Staff Types</h2>
          <p className="text-muted-foreground">Manage employee classification types</p>
        </div>
        <StaffTypesTable />
      </div>
    </DashboardLayout>
  )
}
