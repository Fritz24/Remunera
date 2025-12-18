import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PayslipsTable } from "@/components/payroll/payslips-table"

export default function PayslipsPage() {
  return (
    <DashboardLayout role="payroll" userName="Payroll Officer">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payslips</h2>
          <p className="text-muted-foreground">View and manage generated payslips</p>
        </div>
        <PayslipsTable />
      </div>
    </DashboardLayout>
  )
}
