"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Eye, ChevronUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function StaffPayslips() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { data: payslips = [], error } = useSWR("/api/staff/payslips", fetcher)

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      paid: "bg-green-100 text-green-800",
      pending: "bg-blue-100 text-blue-800",
      cancelled: "bg-gray-100 text-gray-800",
    }
    return colors[status] || colors.pending
  }

  const getMonthName = (month: number) => {
    return new Date(0, month - 1).toLocaleString("default", { month: "long" })
  }

  if (error) return <div>Failed to load payslips</div>
  if (!payslips.length)
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">No payslips available yet</CardContent>
      </Card>
    )

  return (
    <div className="space-y-4">
      {payslips.map((payslip: any) => (
        <Card key={payslip.id}>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <CardTitle>
                  {getMonthName(payslip.month)} {payslip.year}
                </CardTitle>
                <Badge variant="secondary" className={getStatusBadge(payslip.status)}>
                  {payslip.status}
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
                <Button size="sm">
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
                      <span className="font-mono">${Number(payslip.basic_salary).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Allowances</span>
                      <span className="font-mono text-green-600">
                        +${Number(payslip.total_allowances).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2 font-semibold">
                      <span>Gross Pay</span>
                      <span className="font-mono">${Number(payslip.gross_pay).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Deductions</h4>
                  <div className="space-y-2 rounded-lg bg-muted/50 p-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Deductions</span>
                      <span className="font-mono text-red-600">
                        -${Number(payslip.total_deductions).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between rounded-lg bg-primary/10 p-4 text-lg font-bold">
                <span>Net Pay</span>
                <span className="font-mono">${Number(payslip.net_pay).toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Generated on: {new Date(payslip.created_at).toLocaleDateString()}</span>
                <span>Payslip ID: {payslip.id}</span>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  )
}
