import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PayrollRunsTable } from "@/components/payroll/payroll-runs-table"

export default function PayrollRunsPage() {
  return (
    <DashboardLayout role="payroll" userName="Payroll Officer">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payroll Runs</h2>
          <p className="text-muted-foreground">Process and manage payroll runs</p>
        </div>
        <PayrollRunsTable />
      </div>
    </DashboardLayout>
  )
}
