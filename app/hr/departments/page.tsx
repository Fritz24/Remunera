import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DepartmentsTable } from "@/components/admin/departments-table"

export default function HRDepartmentsPage() {
  return (
    <DashboardLayout role="hr" userName="HR Manager">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Departments</h2>
          <p className="text-muted-foreground">View and manage organizational departments</p>
        </div>
        <DepartmentsTable />
      </div>
    </DashboardLayout>
  )
}
