"use client"

import { useState } from "react"
import { formatCfa } from "@/lib/utils/formatters"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { AddEditAllowanceModal } from "./add-edit-allowance-modal"
import useSWR from "swr"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function AllowancesTable() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedAllowance, setSelectedAllowance] = useState<any>(null)

  const { data: allowances = [], error, mutate } = useSWR("/api/payroll/allowances", fetcher)

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this allowance?")) return

    try {
      const response = await fetch(`/api/payroll/allowances?id=${id}`, { method: "DELETE" })
      if (response.ok) {
        mutate()
        toast.success("Allowance deleted successfully!")
      }
    } catch (error) {
      console.error("Failed to delete allowance:", error)
    }
  }

  if (error) return <div>Failed to load allowances</div>

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Allowances</CardTitle>
            <Button
              onClick={() => {
                setSelectedAllowance(null)
                setIsModalOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Allowance
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
                {allowances.map((allowance: any) => (
                  <TableRow key={allowance.id}>
                    <TableCell className="font-medium">{allowance.name}</TableCell>
                    <TableCell className="font-mono">
                      {formatCfa(Number(allowance.amount))}
                    </TableCell>
                    <TableCell>{allowance.description}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAllowance(allowance)
                            setIsModalOpen(true)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(allowance.id)}>
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

      <AddEditAllowanceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          mutate()
        }}
        allowance={selectedAllowance}
      />
    </>
  )
}
