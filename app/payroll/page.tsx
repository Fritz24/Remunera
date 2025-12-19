"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, FileText, Users, TrendingUp, UserX, History, Briefcase } from "lucide-react" // Import History and Briefcase
import Link from "next/link"
import { useState } from "react"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { formatCfa, formatRelativeTime } from "@/lib/utils/formatters" // Import formatRelativeTime

const fetcher = async (url: string) => {
  const supabase = createClient()
  const { data, error } = await supabase.from(url).select('*')
  if (error) throw error
  return data
}

export default function PayrollDashboard() {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const { data: payrollSummary, error: payrollSummaryError, isLoading: payrollSummaryLoading } = useSWR(
    `payroll_summary_${currentMonth}_${currentYear}`,
    async () => {
      const supabase = createClient();

      // Total Payroll (Net from latest payroll run)
      const { data: latestPayrollRun, error: runError } = await supabase
        .from('payroll_run')
        .select('total_net')
        .eq('month', currentMonth)
        .eq('year', currentYear)
        .order('processed_at', { ascending: false })
        .limit(1)
        .single();

      if (runError && runError.code !== 'PGRST116') {
        console.error("Error fetching latest payroll run:", runError)
        throw runError;
      }
      const totalPayroll = latestPayrollRun?.total_net || 0;

      // Staff Paid & Payslips Generated
      const { count: payslipsGeneratedCount, error: payslipsGeneratedError } = await supabase
        .from('payslip')
        .select('id', { count: 'exact', head: true })
        .eq('month', currentMonth)
        .eq('year', currentYear);

      if (payslipsGeneratedError) {
        console.error("Error fetching payslips generated count:", payslipsGeneratedError)
        throw payslipsGeneratedError;
      }
      const payslipsGenerated = payslipsGeneratedCount || 0;

      const { count: staffPaidCount, error: staffPaidError } = await supabase
        .from('payslip')
        .select('id', { count: 'exact', head: true })
        .eq('month', currentMonth)
        .eq('year', currentYear)
        .in('status', ['paid', 'approved']); // Considering approved as paid for this metric

      if (staffPaidError) {
        console.error("Error fetching staff paid count:", staffPaidError)
        throw staffPaidError;
      }
      const staffPaid = staffPaidCount || 0;

      // Staff Unpaid
      const { count: staffUnpaidCount, error: staffUnpaidError } = await supabase
        .from('payslip')
        .select('id', { count: 'exact', head: true })
        .eq('month', currentMonth)
        .eq('year', currentYear)
        .not('status', 'in', '("paid", "approved", "cancelled")'); // Count payslips not paid, approved, or cancelled

      if (staffUnpaidError) {
        console.error("Error fetching staff unpaid count:", staffUnpaidError)
        throw staffUnpaidError;
      }
      const staffUnpaid = staffUnpaidCount || 0;

      // Average Salary
      const { data: avgSalaryData, error: avgSalaryError } = await supabase
        .from('payslip')
        .select('net_pay')
        .eq('month', currentMonth)
        .eq('year', currentYear);

      if (avgSalaryError) {
        console.error("Error fetching avg salary data:", avgSalaryError)
        throw avgSalaryError;
      }

      const totalNetPays = avgSalaryData?.reduce((sum, payslip) => sum + payslip.net_pay, 0) || 0;
      const avgSalary = payslipsGenerated > 0 ? totalNetPays / payslipsGenerated : 0;

      // Calculate previous month's average salary for comparison
      const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      const { data: prevAvgSalaryData, error: prevAvgSalaryError } = await supabase
        .from('payslip')
        .select('net_pay')
        .eq('month', previousMonth)
        .eq('year', previousYear);

      if (prevAvgSalaryError) {
        console.error("Error fetching previous month avg salary data:", prevAvgSalaryError)
      }
      const totalPrevNetPays = prevAvgSalaryData?.reduce((sum, payslip) => sum + payslip.net_pay, 0) || 0;
      const prevPayslipsGenerated = prevAvgSalaryData?.length || 0;
      const prevAvgSalary = prevPayslipsGenerated > 0 ? totalPrevNetPays / prevPayslipsGenerated : 0;

      const avgSalaryChange = prevAvgSalary > 0 ? ((avgSalary - prevAvgSalary) / prevAvgSalary) * 100 : 0;

      return {
        totalPayroll,
        staffPaid,
        staffUnpaid, // Add staffUnpaid to the summary object
        payslipsGenerated,
        avgSalary,
        avgSalaryChange,
      };
    }
  );

  const { data: recentPayrollRuns, error: recentRunsError, isLoading: recentRunsLoading } = useSWR(
    `recent_payroll_runs`,
    async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('payroll_run')
        .select('id, month, year, total_net, processed_at, status')
        .order('processed_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error("Error fetching recent payroll runs:", error);
        throw error;
      }

      return data.map(run => ({
        ...run,
        period: `${format(new Date(run.year, run.month - 1), 'MMMM yyyy')}`,
        completedOn: run.processed_at ? format(new Date(run.processed_at), 'MMM dd, yyyy') : 'N/A',
      }));
    }
  );

  const { data: recentActivities, error: activitiesError, isLoading: activitiesLoading } = useSWR(
    `/api/payroll/activities`,
    async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch recent activities");
      }
      return response.json();
    }
  );

  if (payrollSummaryError || recentRunsError || activitiesError) {
    return <DashboardLayout role="payroll" userName="Payroll Officer"><div>Error loading dashboard data.</div></DashboardLayout>
  }

  return (
    <DashboardLayout role="payroll" userName="Payroll Officer">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payroll Dashboard</h2>
          <p className="text-muted-foreground">Manage payroll, allowances, deductions, and generate payslips</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5"> {/* 5 columns for summary cards */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {payrollSummaryLoading ? 'Loading...' : formatCfa(payrollSummary?.totalPayroll || 0)}
              </div>
              <p className="text-xs text-muted-foreground">Current month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Staff Paid</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {payrollSummaryLoading ? 'Loading...' : payrollSummary?.staffPaid || 0}
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Staff Unpaid</CardTitle>
              <UserX className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {payrollSummaryLoading ? 'Loading...' : payrollSummary?.staffUnpaid || 0}
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payslips Generated</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {payrollSummaryLoading ? 'Loading...' : payrollSummary?.payslipsGenerated || 0}
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Salary</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {payrollSummaryLoading ? 'Loading...' : formatCfa(payrollSummary?.avgSalary || 0)}
              </div>
              <p className={`text-xs ${payrollSummary?.avgSalaryChange && payrollSummary.avgSalaryChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {payrollSummaryLoading ? '' : `${payrollSummary?.avgSalaryChange ? (payrollSummary.avgSalaryChange > 0 ? '+' : '') + payrollSummary.avgSalaryChange.toFixed(1) : '0.0'}% from last month`}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"> {/* Changed to lg:grid-cols-3 for 3 cards */}
          <Card className="lg:col-span-2"> {/* Recent Payroll Runs takes 2 columns */}
            <CardHeader>
              <CardTitle>Recent Payroll Runs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentRunsLoading ? (
                  <div className="text-center text-muted-foreground">Loading recent payroll runs...</div>
                ) : recentPayrollRuns?.length > 0 ? (
                  recentPayrollRuns.map((run) => (
                    <div key={run.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{run.period}</p>
                        <p className="text-xs text-muted-foreground">Completed on {run.completedOn}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{formatCfa(run.total_net || 0)}</p>
                        <p className={`text-xs ${run.status === 'approved' || run.status === 'paid' || run.status === 'complete' ? 'text-green-600' : 'text-yellow-600'}`}>
                          {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground">No recent payroll runs.</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* New Recent Activities Card */}
          <Card> {/* Recent Activities takes 1 column */}
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><History className="h-5 w-5" /> Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activitiesLoading ? (
                  <div className="text-center text-muted-foreground">Loading recent activities...</div>
                ) : recentActivities?.length > 0 ? (
                  recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        {activity.type === "staff" && <Users className="h-4 w-4 text-primary" />}
                        {activity.type === "position" && <Briefcase className="h-4 w-4 text-primary" />}
                        {(activity.type === "allowance" || activity.type === "deduction" || activity.type === "payslip") && <FileText className="h-4 w-4 text-primary" />}
                        {activity.type === "payroll_run" && <DollarSign className="h-4 w-4 text-primary" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatRelativeTime(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground">No recent activities.</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href="/payroll/salary?tab=part-time" className="block">
                  <div className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Upload Attendance</p>
                      <p className="text-xs text-muted-foreground">Import CSV attendance data</p>
                    </div>
                  </div>
                </Link>
                <Link href="/payroll/runs" className="block">
                  <div className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Run Payroll</p>
                      <p className="text-xs text-muted-foreground">Process monthly payroll</p>
                    </div>
                  </div>
                </Link>
                <Link href="/payroll/payslips" className="block">
                  <div className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">View Payslips</p>
                      <p className="text-xs text-muted-foreground">Access generated payslips</p>
                    </div>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
