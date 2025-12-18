import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, FileText, Users, TrendingUp } from "lucide-react"

export default function PayrollDashboard() {
  return (
    <DashboardLayout role="payroll" userName="Payroll Officer">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payroll Dashboard</h2>
          <p className="text-muted-foreground">Manage payroll, allowances, deductions, and generate payslips</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$1,245,680</div>
              <p className="text-xs text-muted-foreground">Current month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Staff Paid</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">265</div>
              <p className="text-xs text-muted-foreground">Out of 287 total</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payslips Generated</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">265</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Salary</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$4,700</div>
              <p className="text-xs text-muted-foreground">+2.5% from last month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Payroll Runs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">December 2024</p>
                    <p className="text-xs text-muted-foreground">Completed on Dec 28, 2024</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">$1,245,680</p>
                    <p className="text-xs text-green-600">Completed</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">November 2024</p>
                    <p className="text-xs text-muted-foreground">Completed on Nov 28, 2024</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">$1,198,450</p>
                    <p className="text-xs text-green-600">Completed</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">October 2024</p>
                    <p className="text-xs text-muted-foreground">Completed on Oct 28, 2024</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">$1,156,320</p>
                    <p className="text-xs text-green-600">Completed</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <a href="/payroll/attendance" className="block">
                  <div className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Upload Attendance</p>
                      <p className="text-xs text-muted-foreground">Import CSV attendance data</p>
                    </div>
                  </div>
                </a>
                <a href="/payroll/runs" className="block">
                  <div className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Run Payroll</p>
                      <p className="text-xs text-muted-foreground">Process monthly payroll</p>
                    </div>
                  </div>
                </a>
                <a href="/payroll/payslips" className="block">
                  <div className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">View Payslips</p>
                      <p className="text-xs text-muted-foreground">Access generated payslips</p>
                    </div>
                  </div>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
