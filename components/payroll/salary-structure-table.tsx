"use client"

import { Button } from "@/components/ui/button"
import { formatCfa } from "@/lib/utils/formatters"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Pencil } from "lucide-react"

const mockSalaryStructure = [
  { id: "1", staffType: "Academic Staff", position: "Professor", baseSalary: 8500 },
  { id: "2", staffType: "Academic Staff", position: "Senior Lecturer", baseSalary: 6500 },
  { id: "3", staffType: "Academic Staff", position: "Lecturer", baseSalary: 4800 },
  { id: "4", staffType: "Administrative Staff", position: "Manager", baseSalary: 5500 },
  { id: "5", staffType: "Administrative Staff", position: "Officer", baseSalary: 3200 },
  { id: "6", staffType: "Technical Staff", position: "Senior Technician", baseSalary: 4200 },
]

export function SalaryStructureTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Salary Structure Configuration</CardTitle>
        <CardDescription>Base salary amounts for different positions and staff types</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Type</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Base Salary</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSalaryStructure.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.staffType}</TableCell>
                  <TableCell className="font-medium">{item.position}</TableCell>
                  <TableCell className="font-mono">{formatCfa(item.baseSalary)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Pencil className="h-4 w-4" />
                    </Button>
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
