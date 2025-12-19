import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StaffManagementTable } from "@/components/hr/staff-management-table"

export default function PayrollEmployeesPage() {
    return (
        <DashboardLayout role="payroll" userName="Payroll Officer">
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Employees</h2>
                    <p className="text-muted-foreground">View all employees and their information</p>
                </div>
                <StaffManagementTable />
            </div>
        </DashboardLayout>
    )
}
