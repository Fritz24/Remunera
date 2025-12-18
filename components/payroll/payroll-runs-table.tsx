"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { RunPayrollModal } from "./run-payroll-modal"

const mockPayrollRuns = [
  {
    id: "1",
    period: "December 2024",
    month: "December",
    year: 2024,
    status: "completed",
    totalGross: 1350000,
    totalDeductions: 104320,
    totalNet: 1245680,
    createdAt: "2024-12-28",
  },
  {
    id: "2",
    period: "November 2024",
    month: "November",
    year: 2024,
    status: "completed",
    totalGross: 1298500,
    totalDeductions: 100050,
    totalNet: 1198450,
    createdAt: "2024-11-28",
  },
  {
    id: "3",
    period: "October 2024",
    month: "October",
    year: 2024,
    status: "completed",
    totalGross: 1250800,
    totalDeductions: 94480,
    totalNet: 1156320,
    createdAt: "2024-10-28",
  },
]

export function PayrollRunsTable() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      completed: "bg-green-100 text-green-800",
      processing: "bg-blue-100 text-blue-800",
      draft: "bg-gray-100 text-gray-800",
    }
    return colors[status] || colors.draft
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Payroll Runs History</CardTitle>
            <Button onClick={() => setIsModalOpen(true)}>
              <Play className="mr-2 h-4 w-4" />
              Run Payroll
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Gross Pay</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Pay</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPayrollRuns.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell className="font-medium">{run.period}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusBadge(run.status)}>
                        {run.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono">${run.totalGross.toLocaleString()}</TableCell>
                    <TableCell className="font-mono text-red-600">-${run.totalDeductions.toLocaleString()}</TableCell>
                    <TableCell className="font-mono font-bold">${run.totalNet.toLocaleString()}</TableCell>
                    <TableCell>{new Date(run.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <RunPayrollModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
