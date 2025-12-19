import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { AllowancesTable } from "@/components/payroll/allowances-table"

export default function AdminAllowancesPage() {
  return (
    <DashboardLayout role="admin" userName="Admin">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Allowances Management</h2>
          <p className="text-muted-foreground">Manage staff allowances and benefits</p>
        </div>
        <AllowancesTable />
      </div>
    </DashboardLayout>
  )
}

