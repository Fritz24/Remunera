"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Eye, Download } from "lucide-react"
import { useState } from "react"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { formatCfa } from "@/lib/utils/formatters"

interface Payslip {
  id: string
  staff_id: string
  staff_name: string
  position_title: string
  month: number
  year: number
  basic_salary: number
  total_allowances: number
  total_deductions: number
  net_pay: number
  status: "pending" | "paid" | "cancelled" | "approved"
  created_at: string
  // Add more fields as needed for display
}

const fetcher = async ([url, status, month, year]: [string, string, string, string]) => {
  const supabase = createClient()
  let query = supabase
    .from("payslip")
    .select(
      `
      id,
      month,
      year,
      basic_salary,
      total_allowances,
      total_deductions,
      net_pay,
      status,
      created_at,
      staff(
        id,
        first_name,
        last_name,
        position(title)
      )
      `
    )
  
  if (status && status !== "all") {
    query = query.eq("status", status)
  }
  if (month && month !== "all") {
    query = query.eq("month", parseInt(month))
  }
  if (year && year !== "all") {
    query = query.eq("year", parseInt(year))
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching payslips:", error)
    throw error
  }

  // Flatten the data for easier rendering
  const formattedData: Payslip[] = data.map((item: any) => ({
    id: item.id,
    staff_id: item.staff.id,
    staff_name: `${item.staff.first_name} ${item.staff.last_name}`,
    position_title: item.staff.position?.title || "N/A",
    month: item.month,
    year: item.year,
    basic_salary: item.basic_salary,
    total_allowances: item.total_allowances,
    total_deductions: item.total_deductions,
    net_pay: item.net_pay,
    status: item.status,
    created_at: item.created_at,
  }))
  return formattedData
}

export function PayslipsContent() {
  const currentYear = new Date().getFullYear()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString())
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString())

  const { data: payslips, error, isLoading } = useSWR<Payslip[]>(
    ["/api/payroll/payslips", selectedStatus, selectedMonth, selectedYear],
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

  const statuses = [
    { value: "all", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "paid", label: "Paid" },
    { value: "cancelled", label: "Cancelled" },
    { value: "approved", label: "Approved" },
  ]

  const filteredPayslips = payslips?.filter((payslip) =>
    payslip.staff_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payslip.position_title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const handleViewPayslip = (payslipId: string) => {
    // Placeholder for viewing payslip - e.g., open in a new tab or modal
    console.log("View payslip:", payslipId)
    // In a real application, you might navigate to a dynamic route like /payroll/payslips/[id]
    // window.open(`/payroll/payslips/${payslipId}`, "_blank")
  }

  const handleDownloadPayslip = (payslipId: string) => {
    // Placeholder for downloading payslip - e.g., trigger a backend download endpoint
    console.log("Download payslip:", payslipId)
    // In a real application, you might call a backend endpoint like /api/payroll/payslips/download?id=payslipId
  }

  if (error) return <div>Failed to load payslips</div>

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Payslips</h2>
        <p className="text-muted-foreground">View and manage generated payslips</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generated Payslips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <Input
              placeholder="Search by staff name or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                <TableHead>Staff Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Basic Salary</TableHead>
                <TableHead>Allowances</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Net Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    Loading payslips...
                  </TableCell>
                </TableRow>
              ) : filteredPayslips.length > 0 ? (
                filteredPayslips.map((payslip) => (
                  <TableRow key={payslip.id}>
                    <TableCell className="font-medium">{payslip.staff_name}</TableCell>
                    <TableCell>{payslip.position_title}</TableCell>
                    <TableCell>{`${new Date(0, payslip.month - 1).toLocaleString("en-US", { month: "long" })} ${payslip.year}`}</TableCell>
                    <TableCell>{formatCfa(payslip.basic_salary)}</TableCell>
                    <TableCell>{formatCfa(payslip.total_allowances)}</TableCell>
                    <TableCell>{formatCfa(payslip.total_deductions)}</TableCell>
                    <TableCell className="font-bold">{formatCfa(payslip.net_pay)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold
                        ${payslip.status === "paid" ? "bg-green-100 text-green-800"
                        : payslip.status === "approved" ? "bg-blue-100 text-blue-800"
                        : payslip.status === "pending" ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"}`}>
                        {payslip.status.charAt(0).toUpperCase() + payslip.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewPayslip(payslip.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDownloadPayslip(payslip.id)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    No payslips found for the selected criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

