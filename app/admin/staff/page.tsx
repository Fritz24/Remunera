import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StaffManagementTable } from "@/components/hr/staff-management-table"

export default function AdminStaffPage() {
  return (
    <DashboardLayout role="admin" userName="Admin">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Staff Management</h2>
          <p className="text-muted-foreground">Add, edit, and manage university staff members</p>
        </div>
        <StaffManagementTable />
      </div>
    </DashboardLayout>
  )
}

