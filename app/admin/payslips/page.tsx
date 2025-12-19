import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PayslipsContent } from "@/components/payroll/payslips-content"

export default function AdminPayslipsPage() {
  return (
    <DashboardLayout role="admin" userName="Admin">
      <PayslipsContent />
    </DashboardLayout>
  )
}

