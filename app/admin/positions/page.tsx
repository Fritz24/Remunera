import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PositionsTable } from "@/components/hr/positions-table"

export default function AdminPositionsPage() {
  return (
    <DashboardLayout role="admin" userName="Admin">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Positions Management</h2>
          <p className="text-muted-foreground">Manage job positions across departments</p>
        </div>
        <PositionsTable />
      </div>
    </DashboardLayout>
  )
}

