"use client"

import type React from "react"

import { useState, useEffect } from "react"
import useSWR from "swr"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AddEditStaffModalProps {
  isOpen: boolean
  onClose: () => void
  staff?: any
}

export function AddEditStaffModal({ isOpen, onClose, staff }: AddEditStaffModalProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    position: "",
    employmentType: "full-time",
    selectedDeduction: "", // New field for selected deduction
    hireDate: "",
    salary: "",
    payPerHour: "",
    status: "active",
  })

  const fetcher = (url: string) => fetch(url).then((res) => res.json())

  const { data: positions, error: positionsError } = useSWR("/api/hr/positions", fetcher)
  const { data: deductions, error: deductionsError } = useSWR("/api/payroll/deductions", fetcher)

  useEffect(() => {
    if (staff) {
      const [firstName, ...lastNameParts] = staff.name.split(" ")
      setFormData({
        firstName,
        lastName: lastNameParts.join(" "),
        email: staff.email,
        password: "", // Password should not be pre-filled
        phone: staff.phone || "",
        position: staff.position_id || "",
        employmentType: staff.employment_status || "full-time",
        selectedDeduction: staff.staff_deduction?.[0]?.deduction_id || "", // Initialize with existing deduction
        hireDate: staff.hire_date || "",
        salary: staff.salary_structure?.basic_salary?.toString() || "",
        payPerHour: staff.hourly_rate?.toString() || "",
        status: staff.employment_status || "active",
      })
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        position: "",
        employmentType: "full-time",
        selectedDeduction: "",
        hireDate: "",
        salary: "",
        payPerHour: "",
        status: "active",
      })
    }
  }, [staff])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      let userId = staff?.user_id

      if (!staff) {
        // Create auth user first if adding new staff
        const userAuthResponse = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            full_name: `${formData.firstName} ${formData.lastName}`,
            role: "staff", // All staff members have the 'staff' role
          }),
        })

        if (!userAuthResponse.ok) {
          const errorData = await userAuthResponse.json()
          throw new Error(errorData.error || "Failed to create user account")
        }

        const userData = await userAuthResponse.json()
        userId = userData.id
      }

      const method = staff ? "PUT" : "POST"
      const url = "/api/hr/staff"
      const payload: any = {
        user_id: userId,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        position_id: formData.position,
        employment_status: formData.employmentType,
        hire_date: formData.hireDate,
        status: formData.status,
      }

    if (formData.employmentType === "full-time") {
      payload.salary = parseFloat(formData.salary)
    } else if (formData.employmentType === "part-time") {
      payload.pay_per_hour = parseFloat(formData.payPerHour)
    }

      // Add deduction only if selected and not "None"
      if (formData.selectedDeduction && formData.selectedDeduction !== "no-deduction") {
        payload.deduction_id = formData.selectedDeduction
      }

      if (staff) {
        payload.id = staff.id
      }

      const staffResponse = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!staffResponse.ok) {
        const errorData = await staffResponse.json()
        throw new Error(errorData.error || "Failed to save staff profile")
      }

      onClose()
      // Optionally show a toast notification for success
      // toast.success(staff ? "Staff updated successfully!" : "Staff created successfully!")

    } catch (error) {
      console.error("Error saving staff:", error)
      alert("Failed to save staff: " + (error as Error).message)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{staff ? "Edit Staff Member" : "Add New Staff Member"}</DialogTitle>
          <DialogDescription>
            {staff ? "Update staff member information" : "Create a new staff member profile"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="employment">Employment Info</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              {!staff && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </TabsContent>

            <TabsContent value="employment" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="employmentType">Employment Type</Label>
                <Select
                  value={formData.employmentType}
                  onValueChange={(value) => setFormData({ ...formData, employmentType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-Time</SelectItem>
                    <SelectItem value="part-time">Part-Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.employmentType === "full-time" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Select
                      value={formData.position}
                      onValueChange={(value) => setFormData({ ...formData, position: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        {positions?.map((position: any) => (
                          <SelectItem key={position.id} value={position.id}>
                            {position.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hireDate">Hire Date</Label>
                      <Input
                        id="hireDate"
                        type="date"
                        value={formData.hireDate}
                        onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="salary">Basic Salary</Label>
                      <Input
                        id="salary"
                        type="number"
                        value={formData.salary}
                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deduction">Deduction</Label>
                    <Select
                      value={formData.selectedDeduction}
                      onValueChange={(value) => setFormData({ ...formData, selectedDeduction: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select deduction" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-deduction">None</SelectItem>
                        {deductions?.map((deduction: any) => (
                          <SelectItem key={deduction.id} value={deduction.id}>
                            {deduction.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {formData.employmentType === "part-time" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Select
                      value={formData.position}
                      onValueChange={(value) => setFormData({ ...formData, position: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        {positions?.map((position: any) => (
                          <SelectItem key={position.id} value={position.id}>
                            {position.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="payPerHour">Pay Per Hour</Label>
                      <Input
                        id="payPerHour"
                        type="number"
                        value={formData.payPerHour}
                        onChange={(e) => setFormData({ ...formData, payPerHour: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hireDate">Hire Date</Label>
                      <Input
                        id="hireDate"
                        type="date"
                        value={formData.hireDate}
                        onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deduction">Deduction</Label>
                    <Select
                      value={formData.selectedDeduction}
                      onValueChange={(value) => setFormData({ ...formData, selectedDeduction: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select deduction" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-deduction">None</SelectItem>
                        {deductions?.map((deduction: any) => (
                          <SelectItem key={deduction.id} value={deduction.id}>
                            {deduction.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{staff ? "Update" : "Create"} Staff</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
