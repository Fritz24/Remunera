import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PayrollRunsContent } from "@/components/payroll/payroll-runs-content"

export default function AdminPayrollRunsPage() {
  return (
    <DashboardLayout role="admin" userName="Admin">
      <PayrollRunsContent />
    </DashboardLayout>
  )
}

