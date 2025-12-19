"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { AddEditStaffModal } from "./add-edit-staff-modal"
import useSWR from "swr"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function StaffManagementTable() {
  const [search, setSearch] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<any>(null)

  const { data: staffList = [], error, mutate } = useSWR(
    "/api/hr/staff",
    (url) =>
      fetch(url)
        .then((res) => res.json())
        .then((data) =>
          data.map((staff: any) => ({
            ...staff,
            basic_salary: staff.salary_structure?.[0]?.basic_salary,
            deduction_name: staff.staff_deduction?.[0]?.deduction?.name,
          })),
        ),
  )

  const handleAddStaff = () => {
    setSelectedStaff(null)
    setIsModalOpen(true)
  }

  const handleEditStaff = (staff: any) => {
    setSelectedStaff(staff)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this staff member?")) return

    try {
      const response = await fetch(`/api/hr/staff?id=${id}`, { method: "DELETE" })
      if (response.ok) {
        mutate()
        toast.success("Staff member deleted successfully!")
      }
    } catch (error) {
      console.error("Failed to delete staff:", error)
    }
  }

  const getEmploymentTypeBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      terminated: "bg-red-100 text-red-800",
      on_leave: "bg-blue-100 text-blue-800",
      // Add colors for full-time and part-time if needed
      "full-time": "bg-purple-100 text-purple-800",
      "part-time": "bg-yellow-100 text-yellow-800",
    }
    return colors[status] || colors.active
  }

  const filteredStaff = staffList.filter(
    (staff: any) =>
      staff.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      staff.last_name?.toLowerCase().includes(search.toLowerCase()) ||
      staff.employment_status?.toLowerCase().includes(search.toLowerCase()) ||
      staff.email?.toLowerCase().includes(search.toLowerCase()) ||
      staff.phone?.toLowerCase().includes(search.toLowerCase()),
  )

  if (error) return <div>Failed to load staff</div>

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Staff Members</CardTitle>
            <Button onClick={handleAddStaff}>
              <Plus className="mr-2 h-4 w-4" />
              Add Staff
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search staff by name, employment type, email, or phone..."
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
                  <TableHead>Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Employment Type</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Hire Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((staff: any) => (
                  <TableRow key={staff.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {staff.first_name} {staff.last_name}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{staff.position?.title || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getEmploymentTypeBadge(staff.employment_status)}>
                        {staff.employment_status}
                      </Badge>
                    </TableCell>
                    <TableCell>{staff.email}</TableCell>
                    <TableCell>{staff.phone || "N/A"}</TableCell>
                    <TableCell>{staff.hire_date || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getEmploymentTypeBadge(staff.status)}>
                        {staff.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditStaff(staff)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(staff.id)}>
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

      <AddEditStaffModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          mutate()
        }}
        staff={selectedStaff}
      />
    </>
  )
}
