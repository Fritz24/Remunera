import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DeductionsTable } from "@/components/payroll/deductions-table"

export default function AdminDeductionsPage() {
  return (
    <DashboardLayout role="admin" userName="Admin">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Deductions Management</h2>
          <p className="text-muted-foreground">Manage staff deductions and contributions</p>
        </div>
        <DeductionsTable />
      </div>
    </DashboardLayout>
  )
}

