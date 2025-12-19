import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PayrollReportsContent } from "@/components/payroll/payroll-reports-content"

export default function AdminReportsPage() {
  return (
    <DashboardLayout role="admin" userName="Admin">
      <PayrollReportsContent />
    </DashboardLayout>
  )
}

