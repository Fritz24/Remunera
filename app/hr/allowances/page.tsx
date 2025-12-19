import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { AllowancesTable } from "@/components/payroll/allowances-table"

export default function AllowancesPage() {
  return (
    <DashboardLayout role="hr" userName="HR Manager">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Allowances</h2>
          <p className="text-muted-foreground">Manage staff allowances and benefits</p>
        </div>
        <AllowancesTable />
      </div>
    </DashboardLayout>
  )
}

