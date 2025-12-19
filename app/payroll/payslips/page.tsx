"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PayslipsContent } from "@/components/payroll/payslips-content"

export default function PayslipsPage() {
  return (
    <DashboardLayout role="payroll" userName="Payroll Officer">
      <PayslipsContent />
    </DashboardLayout>
  )
}
