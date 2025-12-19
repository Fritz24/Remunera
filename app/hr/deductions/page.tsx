import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DeductionsTable } from "@/components/payroll/deductions-table"

export default function DeductionsPage() {
  return (
    <DashboardLayout role="hr" userName="HR Manager">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Deductions</h2>
          <p className="text-muted-foreground">Manage staff deductions and contributions</p>
        </div>
        <DeductionsTable />
      </div>
    </DashboardLayout>
  )
}

