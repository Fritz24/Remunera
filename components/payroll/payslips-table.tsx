"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Download, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const mockPayslips = [
  {
    id: "1",
    staffName: "Dr. Jane Smith",
    period: "December 2024",
    basicSalary: 6500,
    grossPay: 7450,
    netPay: 6280,
    status: "paid",
  },
  {
    id: "2",
    staffName: "Prof. John Doe",
    period: "December 2024",
    basicSalary: 8500,
    grossPay: 9650,
    netPay: 8120,
    status: "paid",
  },
  {
    id: "3",
    staffName: "Sarah Johnson",
    period: "December 2024",
    basicSalary: 5500,
    grossPay: 6200,
    netPay: 5220,
    status: "approved",
  },
]

export function PayslipsTable() {
  const [search, setSearch] = useState("")

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      paid: "bg-green-100 text-green-800",
      approved: "bg-blue-100 text-blue-800",
      draft: "bg-gray-100 text-gray-800",
    }
    return colors[status] || colors.draft
  }

  const filteredPayslips = mockPayslips.filter((payslip) =>
    payslip.staffName.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generated Payslips</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by staff name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Name</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Basic Salary</TableHead>
                <TableHead>Gross Pay</TableHead>
                <TableHead>Net Pay</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayslips.map((payslip) => (
                <TableRow key={payslip.id}>
                  <TableCell className="font-medium">{payslip.staffName}</TableCell>
                  <TableCell>{payslip.period}</TableCell>
                  <TableCell className="font-mono">${payslip.basicSalary.toLocaleString()}</TableCell>
                  <TableCell className="font-mono">${payslip.grossPay.toLocaleString()}</TableCell>
                  <TableCell className="font-mono font-bold">${payslip.netPay.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusBadge(payslip.status)}>
                      {payslip.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
