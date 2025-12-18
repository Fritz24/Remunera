import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { AttendanceUpload } from "@/components/payroll/attendance-upload"

export default function AttendancePage() {
  return (
    <DashboardLayout role="payroll" userName="Payroll Officer">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Upload Attendance</h2>
          <p className="text-muted-foreground">Import attendance data via CSV file</p>
        </div>
        <AttendanceUpload />
      </div>
    </DashboardLayout>
  )
}
