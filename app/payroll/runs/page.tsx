"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Eye, Play } from "lucide-react"
import { useState } from "react"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"

interface PayrollRun {
  id: string
  month: number
  year: number
  status: "draft" | "processing" | "approved" | "paid" | "complete" | "incomplete"
  total_gross: number
  total_deductions: number
  total_net: number
  processed_at: string
}

const fetcher = async ([url, month, year]: [string, string, string]) => {
  const supabase = createClient()
  let query = supabase
    .from("payroll_run")
    .select(
      `
      id,
      month,
      year,
      status,
      total_gross,
      total_deductions,
      total_net,
      processed_at
      `
    )

  if (month && month !== "all") {
    query = query.eq("month", parseInt(month))
  }
  if (year && year !== "all") {
    query = query.eq("year", parseInt(year))
  }

  const { data, error } = await query.order("year", { ascending: false }).order("month", { ascending: false })

  if (error) {
    console.error("Error fetching payroll runs:", error)
    throw error
  }

  return data as PayrollRun[]
}

export default function PayrollRunsPage() {
  const currentYear = new Date().getFullYear()
  const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString())
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString())

  const { data: payrollRuns, error, isLoading } = useSWR<PayrollRun[]>(
    ["/api/payroll/runs", selectedMonth, selectedYear],
    fetcher
  )

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: new Date(0, i).toLocaleString("en-US", { month: "long" }),
  }))
  months.unshift({ value: "all", label: "All Months" })

  const years = Array.from({ length: 5 }, (_, i) => ({
    value: (currentYear - i).toString(),
    label: (currentYear - i).toString(),
  }))
  years.unshift({ value: "all", label: "All Years" })

  const handleViewDetails = (runId: string) => {
    console.log("View payroll run details:", runId)
    // In a real application, you might navigate to a dynamic route like /payroll/runs/[id]
  }

  const handleRunPayroll = () => {
    console.log("Run Payroll clicked for period:", selectedMonth, selectedYear)
    // Implement logic to trigger a new payroll run, likely calling a backend API
  }

  if (error) return <DashboardLayout role="payroll" userName="Payroll Officer"><div>Failed to load payroll runs.</div></DashboardLayout>

  return (
    <DashboardLayout role="payroll" userName="Payroll Officer">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payroll Runs</h2>
          <p className="text-muted-foreground">Process and manage payroll runs</p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Payroll Runs History</CardTitle>
            <Button onClick={handleRunPayroll} disabled={isLoading} className="ml-auto">
              <Play className="mr-2 h-4 w-4" /> Run Payroll
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year.value} value={year.value}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Overall Gross Pay</TableHead>
                  <TableHead>Overall Deductions</TableHead>
                  <TableHead>Overall Net Salary</TableHead>
                  <TableHead>Processed Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Loading payroll runs...
                    </TableCell>
                  </TableRow>
                ) : payrollRuns?.length > 0 ? (
                  payrollRuns.map((run) => (
                    <TableRow key={run.id}>
                      <TableCell className="font-medium">
                        {`${new Date(0, run.month - 1).toLocaleString("en-US", { month: "long" })} ${run.year}`}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold
                          ${run.status === "complete" ? "bg-green-100 text-green-800"
                            : run.status === "approved" ? "bg-blue-100 text-blue-800"
                              : run.status === "pending" ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"}`}>
                          {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>${run.total_gross.toLocaleString()}</TableCell>
                      <TableCell className="text-red-600">-${run.total_deductions.toLocaleString()}</TableCell>
                      <TableCell className="font-bold">${run.total_net.toLocaleString()}</TableCell>
                      <TableCell>{run.processed_at ? format(new Date(run.processed_at), "MM/dd/yyyy") : "N/A"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetails(run.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No payroll runs found for the selected period.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
