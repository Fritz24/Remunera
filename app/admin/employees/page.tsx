import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StaffManagementTable } from "@/components/hr/staff-management-table"

export default function AdminEmployeesPage() {
  return (
    <DashboardLayout role="admin" userName="Admin">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Employees</h2>
          <p className="text-muted-foreground">Manage all employees and their roles</p>
        </div>
        <StaffManagementTable />
      </div>
    </DashboardLayout>
  )
}

