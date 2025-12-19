"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Receipt, Calendar, Banknote, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { formatCfa, formatRelativeTime } from "@/lib/utils/formatters"

interface StaffData {
    id: string
    first_name: string
    last_name: string
    employment_status: string
    hire_date: string
    salary_structure: { basic_salary: number }[]
    position: { title: string }
    staff_allowance: { amount: number; allowance: { name: string; amount: number } }[]
    staff_deduction: { amount: number; deduction: { name: string; amount: number } }[]
}

interface PayslipData {
    id: string
    month: number
    year: number
    basic_salary: number
    total_allowances: number
    total_deductions: number
    net_pay: number
    status: string
}

export default function PayrollPersonalDashboard() {
    const [userName, setUserName] = useState("Payroll Officer")
    const supabase = createClient()

    const { data: userProfile } = useSWR(
        "userProfile",
        async () => {
            const { data: { user }, error: authError } = await supabase.auth.getUser()
            if (authError || !user) throw new Error("User not authenticated.")

            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("full_name")
                .eq("id", user.id)
                .single()

            if (profileError) throw profileError
            setUserName(profile.full_name || "Payroll Officer")
            return { user, profile }
        }
    )

    const { data: staffData, isLoading: staffLoading } = useSWR<StaffData>(
        userProfile?.user?.id ? `staff_${userProfile.user.id}` : null,
        async () => {
            if (!userProfile?.user?.id) return null
            const { data: staff, error } = await supabase
                .from("staff")
                .select(`
          id, first_name, last_name, employment_status, hire_date,
          salary_structure(basic_salary),
          position(title),
          staff_allowance(amount, allowance(name, amount)),
          staff_deduction(amount, deduction(name, amount))
        `)
                .eq("user_id", userProfile.user.id)
                .single()
            if (error) throw error
            return staff
        }
    )

    const { data: latestPayslip, isLoading: payslipLoading } = useSWR<PayslipData>(
        staffData?.id ? `latest_payslip_${staffData.id}` : null,
        async () => {
            if (!staffData?.id) return null
            const { data, error } = await supabase
                .from("payslip")
                .select("id, month, year, basic_salary, total_allowances, total_deductions, net_pay, status")
                .eq("staff_id", staffData.id)
                .order("year", { ascending: false })
                .order("month", { ascending: false })
                .limit(1)
                .single()
            if (error && error.code !== 'PGRST116') throw error
            return data
        }
    )

    const { data: recentActivities, isLoading: activitiesLoading } = useSWR(
        userProfile?.user?.id ? `/api/employee/recent-changes?userId=${userProfile.user.id}` : null,
        async (url) => {
            const response = await fetch(url)
            if (!response.ok) throw new Error("Failed to fetch recent activities")
            return response.json()
        }
    )

    const basicSalary = staffData?.salary_structure?.[0]?.basic_salary || 0

    // Calculate estimated net salary
    const totalAllowances = staffData?.staff_allowance?.reduce((sum: number, item: any) => {
        return sum + (item.amount || item.allowance?.amount || 0)
    }, 0) || 0

    const totalDeductions = staffData?.staff_deduction?.reduce((sum: number, item: any) => {
        return sum + (item.amount || item.deduction?.amount || 0)
    }, 0) || 0

    const estimatedNetSalary = basicSalary + totalAllowances - totalDeductions

    const yearsOfService = staffData?.hire_date
        ? ((new Date().getTime() - new Date(staffData.hire_date).getTime()) / (1000 * 60 * 60 * 24 * 365)).toFixed(1)
        : "0"

    return (
        <DashboardLayout role="payroll" userName={userName}>
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">My Personal Dashboard</h2>
                    <p className="text-muted-foreground">View your personal employee information and payslips</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Current Net Salary</CardTitle>
                            <Banknote className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {staffLoading ? 'Loading...' : formatCfa(estimatedNetSalary)}
                            </div>
                            <p className="text-xs text-muted-foreground">Estimated monthly net pay</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Last Payslip</CardTitle>
                            <Receipt className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {payslipLoading ? 'Loading...' : formatCfa(latestPayslip?.net_pay || 0)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {payslipLoading ? 'Loading...' :
                                    latestPayslip
                                        ? `${new Date(0, latestPayslip.month - 1).toLocaleString("default", { month: "long" })} ${latestPayslip.year}`
                                        : "No payslip yet"}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Position</CardTitle>
                            <User className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{staffLoading ? 'Loading...' : staffData?.position?.title || "N/A"}</div>
                            <p className="text-xs text-muted-foreground">{staffLoading ? 'Loading...' : staffData?.employment_status || "Status"}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Years of Service</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{staffLoading ? 'Loading...' : yearsOfService}</div>
                            <p className="text-xs text-muted-foreground">
                                Since {staffLoading ? 'Loading...' : staffData?.hire_date ? format(new Date(staffData.hire_date), "PPP") : "N/A"}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Links</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Link href="/payroll/profile" className="block">
                                    <div className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted">
                                        <User className="h-5 w-5 text-primary" />
                                        <div>
                                            <p className="text-sm font-medium">View My Profile</p>
                                            <p className="text-xs text-muted-foreground">Personal and employment information</p>
                                        </div>
                                    </div>
                                </Link>
                                <Link href="/payroll/payslips" className="block">
                                    <div className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted">
                                        <Receipt className="h-5 w-5 text-primary" />
                                        <div>
                                            <p className="text-sm font-medium">My Payslips</p>
                                            <p className="text-xs text-muted-foreground">Download payslip history</p>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Latest Payslip</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {payslipLoading ? (
                                <div className="text-center text-muted-foreground">Loading latest payslip...</div>
                            ) : latestPayslip ? (
                                <>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Period</span>
                                            <span className="font-medium">
                                                {format(new Date(latestPayslip.year, latestPayslip.month - 1), "MMMM yyyy")}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Basic Salary</span>
                                            <span className="font-mono">{formatCfa(latestPayslip.basic_salary)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Allowances</span>
                                            <span className="font-mono text-green-600">
                                                +{formatCfa(latestPayslip.total_allowances)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Deductions</span>
                                            <span className="font-mono text-red-600">
                                                -{formatCfa(latestPayslip.total_deductions)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between border-t pt-2 font-bold">
                                            <span>Net Pay</span>
                                            <span className="font-mono">{formatCfa(latestPayslip.net_pay)}</span>
                                        </div>
                                    </div>
                                    <Button className="w-full" variant="outline" asChild>
                                        <Link href="/payroll/payslips">
                                            <Receipt className="mr-2 h-4 w-4" />
                                            View All Payslips
                                        </Link>
                                    </Button>
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground">No payslips available yet</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><History className="h-5 w-5" /> Recent Changes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {activitiesLoading ? (
                                <div className="text-center text-muted-foreground">Loading recent changes...</div>
                            ) : recentActivities?.length > 0 ? (
                                <div className="space-y-4">
                                    {recentActivities.map((activity: any, index: number) => (
                                        <div key={index} className="flex items-start gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                                {activity.type === "staff_profile" && <User className="h-4 w-4 text-primary" />}
                                                {activity.type === "salary_structure" && <Banknote className="h-4 w-4 text-primary" />}
                                                {activity.type === "payslip_generated" && <Receipt className="h-4 w-4 text-primary" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">{activity.description}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatRelativeTime(activity.timestamp)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No recent changes found for your account.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
