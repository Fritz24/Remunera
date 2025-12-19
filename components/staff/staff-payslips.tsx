"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Eye, ChevronUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { formatCfa } from "@/lib/utils/formatters"

interface Payslip {
  id: string
  month: number
  year: number
  basic_salary: number
  total_allowances: number
  total_deductions: number
  gross_pay: number
  net_pay: number
  status: string
  payment_date: string | null
  staff: { first_name: string; last_name: string; position: { title: string } }
}

const fetcher = async ([url, month, year]: [string, string, string]) => {
  const response = await fetch(`${url}?month=${month}&year=${year}`);
  if (!response.ok) {
    throw new Error("Failed to fetch payslips");
  }
  return response.json();
};

export function StaffPayslips() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString());
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());

  const { data: payslips, error, isLoading } = useSWR<Payslip[]>(
    [`/api/staff/payslips`, selectedMonth, selectedYear],
    fetcher
  );

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: new Date(0, i).toLocaleString("en-US", { month: "long" }),
  }));
  months.unshift({ value: "all", label: "All Months" });

  const years = Array.from({ length: 5 }, (_, i) => ({
    value: (currentYear - i).toString(),
    label: (currentYear - i).toString(),
  }));
  years.unshift({ value: "all", label: "All Years" });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getStatusBadge = (status: string) => {
    if (status === "paid") return "bg-green-100 text-green-800 hover:bg-green-100"
    return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
  };

  const handleDownloadPayslip = (payslipId: string) => {
    window.open(`/admin/payslips/${payslipId}/print`, "_blank")
  };

  if (error) return <div className="text-center text-destructive">Failed to load payslips</div>;
  if (isLoading) return <div className="text-center text-muted-foreground">Loading payslips...</div>;
  if (!payslips || payslips.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">No payslips available yet for the selected period.</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[180px]" suppressHydrationWarning>
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
          <SelectTrigger className="w-[180px]" suppressHydrationWarning>
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

      {payslips.map((payslip: Payslip) => (
        <Card key={payslip.id}>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <CardTitle>
                  {format(new Date(payslip.year, payslip.month - 1), "MMMM yyyy")}
                </CardTitle>
                <Badge variant="secondary" className={getStatusBadge(payslip.status)}>
                  {payslip.status === "paid" ? "Paid" : "Unpaid"}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => toggleExpand(payslip.id)}>
                  {expandedId === payslip.id ? (
                    <>
                      <ChevronUp className="mr-2 h-4 w-4" />
                      Hide Details
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </>
                  )}
                </Button>
                <Button size="sm" onClick={() => handleDownloadPayslip(payslip.id)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          </CardHeader>

          {expandedId === payslip.id && (
            <CardContent className="space-y-4 border-t pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Earnings</h4>
                  <div className="space-y-2 rounded-lg bg-muted/50 p-3">
                    <div className="flex justify-between text-sm">
                      <span>Basic Salary</span>
                      <span className="font-mono">{formatCfa(payslip.basic_salary)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Allowances</span>
                      <span className="font-mono text-green-600">
                        +{formatCfa(payslip.total_allowances)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2 font-semibold">
                      <span>Gross Pay</span>
                      <span className="font-mono">{formatCfa(payslip.gross_pay)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Deductions</h4>
                  <div className="space-y-2 rounded-lg bg-muted/50 p-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Deductions</span>
                      <span className="font-mono text-red-600">
                        -{formatCfa(payslip.total_deductions)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between rounded-lg bg-primary/10 p-4 text-lg font-bold">
                <span>Net Pay</span>
                <span className="font-mono">{formatCfa(payslip.net_pay)}</span>
              </div>

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Generated on: {payslip.payment_date ? format(new Date(payslip.payment_date), "PPP") : format(new Date(payslip.created_at), "PPP")}</span>
                <span>Payslip ID: {payslip.id}</span>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
