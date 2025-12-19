"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { AddEditDeductionModal } from "./add-edit-deduction-modal"
import useSWR from "swr"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function DeductionsTable() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDeduction, setSelectedDeduction] = useState<any>(null)

  const { data: deductions = [], error, mutate } = useSWR("/api/payroll/deductions", fetcher)

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this deduction?")) return

    try {
      const response = await fetch(`/api/payroll/deductions?id=${id}`, { method: "DELETE" })
      if (response.ok) {
        mutate()
        toast.success("Deduction deleted successfully!")
      }
    } catch (error) {
      console.error("Failed to delete deduction:", error)
    }
  }

  if (error) return <div>Failed to load deductions</div>

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
                  <TableHead>Amount</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deductions.map((deduction: any) => (
                  <TableRow key={deduction.id}>
                    <TableCell className="font-medium">{deduction.name}</TableCell>
                    <TableCell className="font-mono">
                      {`$${Number(deduction.amount).toLocaleString()}`}
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
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(deduction.id)}>
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

      <AddEditDeductionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          mutate()
        }}
        deduction={selectedDeduction}
      />
    </>
  )
}
