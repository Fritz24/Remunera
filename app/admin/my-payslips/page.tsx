import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StaffPayslips } from "@/components/staff/staff-payslips"

export default function AdminMyPayslipsPage() {
    return (
        <DashboardLayout role="admin" userName="Admin">
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">My Payslips</h2>
                    <p className="text-muted-foreground">View and download your personal payslip history</p>
                </div>
                <StaffPayslips />
            </div>
        </DashboardLayout>
    )
}
