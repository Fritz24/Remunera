"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { AddEditPositionModal } from "./add-edit-position-modal"

const mockPositions = [
  { id: "1", title: "Professor", department: "Computer Science", description: "Senior academic position" },
  { id: "2", title: "Senior Lecturer", department: "Mathematics", description: "Teaching and research role" },
  { id: "3", title: "Lecturer", department: "Engineering", description: "Academic teaching position" },
  { id: "4", title: "HR Manager", department: "Human Resources", description: "HR management position" },
  { id: "5", title: "IT Support", department: "IT Services", description: "Technical support role" },
]

export function PositionsTable() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<any>(null)

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Job Positions</CardTitle>
            <Button
              onClick={() => {
                setSelectedPosition(null)
                setIsModalOpen(true)
              }}
            >
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
                  <TableHead>Department</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPositions.map((position) => (
                  <TableRow key={position.id}>
                    <TableCell className="font-medium">{position.title}</TableCell>
                    <TableCell>{position.department}</TableCell>
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

      <AddEditPositionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} position={selectedPosition} />
    </>
  )
}
