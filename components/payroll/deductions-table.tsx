"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { AddEditDeductionModal } from "./add-edit-deduction-modal"

const mockDeductions = [
  { id: "1", name: "Income Tax", type: "percentage", amount: 15, description: "Federal income tax" },
  { id: "2", name: "Social Security", type: "percentage", amount: 6.2, description: "Social security contribution" },
  { id: "3", name: "Medicare", type: "percentage", amount: 1.45, description: "Medicare contribution" },
  { id: "4", name: "Health Insurance", type: "fixed", amount: 150, description: "Monthly health insurance premium" },
]

export function DeductionsTable() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDeduction, setSelectedDeduction] = useState<any>(null)

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Deductions</CardTitle>
            <Button
              onClick={() => {
                setSelectedDeduction(null)
                setIsModalOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Deduction
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockDeductions.map((deduction) => (
                  <TableRow key={deduction.id}>
                    <TableCell className="font-medium">{deduction.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          deduction.type === "fixed" ? "bg-blue-100 text-blue-800" : "bg-orange-100 text-orange-800"
                        }
                      >
                        {deduction.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono">
                      {deduction.type === "percentage" ? `${deduction.amount}%` : `$${deduction.amount}`}
                    </TableCell>
                    <TableCell>{deduction.description}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedDeduction(deduction)
                            setIsModalOpen(true)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
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

      <AddEditDeductionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} deduction={selectedDeduction} />
    </>
  )
}
