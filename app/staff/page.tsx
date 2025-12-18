import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Receipt, Calendar, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

export default async function StaffDashboard() {
  const { profile } = await getCurrentUser()
  const supabase = await createClient()

  const { data: staff } = await supabase
    .from("staff")
    .select(
      `
      *,
      staff_type:staff_type_id(name),
      salary_structure!inner(basic_salary)
    `,
    )
    .eq("user_id", profile.id)
    .eq("salary_structure.is_active", true)
    .single()

  const { data: latestPayslip } = await supabase
    .from("payslip")
    .select("*")
    .eq("staff_id", staff?.id)
    .order("year", { ascending: false })
    .order("month", { ascending: false })
    .limit(1)
    .single()

  const basicSalary = staff?.salary_structure?.[0]?.basic_salary || 0
  const yearsOfService = staff?.hire_date
    ? ((new Date().getTime() - new Date(staff.hire_date).getTime()) / (1000 * 60 * 60 * 24 * 365)).toFixed(1)
    : "0"

  return (
    <DashboardLayout role="staff" userName={profile.full_name}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome Back, {staff?.first_name || "User"}</h2>
          <p className="text-muted-foreground">View your profile and payslip information</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Salary</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${basicSalary.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Basic monthly salary</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Payslip</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${latestPayslip?.net_pay ? Number(latestPayslip.net_pay).toLocaleString() : "0"}
              </div>
              <p className="text-xs text-muted-foreground">
                {latestPayslip
                  ? `${new Date(0, latestPayslip.month - 1).toLocaleString("default", { month: "long" })} ${latestPayslip.year}`
                  : "No payslip yet"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Employment Type</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{staff?.staff_type?.name || "N/A"}</div>
              <p className="text-xs text-muted-foreground">{staff?.employment_status || "Status"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Years of Service</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{yearsOfService}</div>
              <p className="text-xs text-muted-foreground">
                Since {staff?.hire_date ? new Date(staff.hire_date).toLocaleDateString() : "N/A"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <a href="/staff/profile" className="block">
                  <div className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted">
                    <User className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">View My Profile</p>
                      <p className="text-xs text-muted-foreground">Personal and employment information</p>
                    </div>
                  </div>
                </a>
                <a href="/staff/payslips" className="block">
                  <div className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted">
                    <Receipt className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">My Payslips</p>
                      <p className="text-xs text-muted-foreground">Download payslip history</p>
                    </div>
                  </div>
                </a>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Latest Payslip</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {latestPayslip ? (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Period</span>
                      <span className="font-medium">
                        {new Date(0, latestPayslip.month - 1).toLocaleString("default", { month: "long" })}{" "}
                        {latestPayslip.year}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Basic Salary</span>
                      <span className="font-mono">${Number(latestPayslip.basic_salary).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Allowances</span>
                      <span className="font-mono text-green-600">
                        +${Number(latestPayslip.total_allowances).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Deductions</span>
                      <span className="font-mono text-red-600">
                        -${Number(latestPayslip.total_deductions).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2 font-bold">
                      <span>Net Pay</span>
                      <span className="font-mono">${Number(latestPayslip.net_pay).toLocaleString()}</span>
                    </div>
                  </div>
                  <Button className="w-full bg-transparent" variant="outline">
                    <Receipt className="mr-2 h-4 w-4" />
                    View Full Payslip
                  </Button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No payslips available yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
