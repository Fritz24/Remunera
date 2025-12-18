import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StaffPayslips } from "@/components/staff/staff-payslips"

export default function StaffPayslipsPage() {
  return (
    <DashboardLayout role="staff" userName="John Smith">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Payslips</h2>
          <p className="text-muted-foreground">View and download your payslip history</p>
        </div>
        <StaffPayslips />
      </div>
    </DashboardLayout>
  )
}
