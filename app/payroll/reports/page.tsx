"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download } from "lucide-react"
import { useState } from "react"

export default function ReportsPage() {
  const currentYear = new Date().getFullYear()
  const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString())
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString())

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

  const handleDownloadReport = (reportType: string) => {
    console.log(`Downloading ${reportType} for ${months.find(m => m.value === selectedMonth)?.label}, ${selectedYear}`)
    // Placeholder for actual download logic
    // You would typically make an API call here to a backend endpoint
    // For example: window.open(`/api/payroll/reports/${reportType}?month=${selectedMonth}&year=${selectedYear}`, '_blank')
  }

  return (
    <DashboardLayout role="payroll" userName="Payroll Officer">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
          <p className="text-muted-foreground">Generate and download payroll reports</p>
        </div>

        <div className="flex items-center gap-4 mb-6 flex-wrap">
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

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Monthly Payroll Summary
              </CardTitle>
              <CardDescription>Comprehensive monthly payroll breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => handleDownloadReport("monthly-summary")}>
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Position Payroll Report {/* Renamed from Department Payroll Report */}
              </CardTitle>
              <CardDescription>Payroll breakdown by position</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => handleDownloadReport("position-payroll")}>
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Deductions Report
              </CardTitle>
              <CardDescription>Summary of all deductions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => handleDownloadReport("deductions")}>
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Allowances Report
              </CardTitle>
              <CardDescription>Breakdown of all allowances paid</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => handleDownloadReport("allowances")}>
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
