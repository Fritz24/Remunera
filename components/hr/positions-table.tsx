"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { AddEditPositionModal } from "./add-edit-position-modal"
import useSWR from "swr"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function PositionsTable() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<any>(null)

  const { data: positions = [], error, mutate } = useSWR(
    "/api/hr/positions",
    (url) =>
      fetch(url)
        .then((res) => res.json())
        .then((data) =>
          data.map((position: any) => ({
            ...position,
            allowance_name: position.position_allowance?.[0]?.allowance?.name,
          })),
        ),
  )

  const handleAddPosition = () => {
    setSelectedPosition(null)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this position?")) return

    try {
      const response = await fetch(`/api/hr/positions?id=${id}`, { method: "DELETE" })
      if (response.ok) {
        mutate()
        toast.success("Position deleted successfully!")
      }
    } catch (error) {
      console.error("Failed to delete position:", error)
    }
  }

  if (error) return <div>Failed to load positions</div>

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Job Positions</CardTitle>
            <Button onClick={handleAddPosition}>
              <Plus className="mr-2 h-4 w-4" />
              Add Position
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position Title</TableHead>
                  <TableHead>Allowance</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map((position: any) => (
                  <TableRow key={position.id}>
                    <TableCell className="font-medium">{position.title}</TableCell>
                    <TableCell>{position.allowance_name || "None"}</TableCell>
                    <TableCell>{position.description}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedPosition(position)
                            setIsModalOpen(true)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(position.id)}>
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

      <AddEditPositionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          mutate()
        }}
        position={selectedPosition}
      />
    </>
  )
}
