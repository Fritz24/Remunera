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
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

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
    role: "staff",
    position: "",
    employmentType: "full-time",
    selectedDeductions: [] as string[],
    selectedAllowances: [] as string[],
    hireDate: "",
    salary: "",
    payPerHour: "",
    status: "active",
  })

  const fetcher = (url: string) => fetch(url).then((res) => res.json())

  const { data: positions, error: positionsError } = useSWR("/api/hr/positions", fetcher)
  const { data: deductions, error: deductionsError } = useSWR("/api/payroll/deductions", fetcher)
  const { data: allowances, error: allowancesError } = useSWR("/api/payroll/allowances", fetcher)

  useEffect(() => {
    if (staff) {
      setFormData({
        firstName: staff.first_name || "",
        lastName: staff.last_name || "",
        email: staff.email,
        password: "",
        phone: staff.phone || "",
        role: staff.profiles?.role || "staff",
        position: staff.position_id || "",
        employmentType: staff.employment_status || "full-time",
        selectedDeductions: staff.staff_deduction?.map((d: any) => d.deduction?.id).filter(Boolean) || [],
        selectedAllowances: staff.staff_allowance?.map((a: any) => a.allowance?.id).filter(Boolean) || [],
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
        role: "staff",
        position: "",
        employmentType: "full-time",
        selectedDeductions: [],
        selectedAllowances: [],
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
            role: formData.role,
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
        employment_status: formData.status, // Use status field, not employmentType
        hire_date: formData.hireDate,
        status: formData.status,
        allowance_ids: formData.selectedAllowances,
        deduction_ids: formData.selectedDeductions,
      }

      if (formData.employmentType === "full-time") {
        payload.salary = parseFloat(formData.salary)
      } else if (formData.employmentType === "part-time") {
        payload.pay_per_hour = parseFloat(formData.payPerHour)
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

  const toggleDeduction = (deductionId: string) => {
    setFormData(prev => {
      const exists = prev.selectedDeductions.includes(deductionId)
      if (exists) {
        return { ...prev, selectedDeductions: prev.selectedDeductions.filter(id => id !== deductionId) }
      } else {
        return { ...prev, selectedDeductions: [...prev.selectedDeductions, deductionId] }
      }
    })
  }

  const toggleAllowance = (allowanceId: string) => {
    setFormData(prev => {
      const exists = prev.selectedAllowances.includes(allowanceId)
      if (exists) {
        return { ...prev, selectedAllowances: prev.selectedAllowances.filter(id => id !== allowanceId) }
      } else {
        return { ...prev, selectedAllowances: [...prev.selectedAllowances, allowanceId] }
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{staff ? "Edit Employee" : "Add New Employee"}</DialogTitle>
          <DialogDescription>
            {staff ? "Update employee information" : "Create a new employee profile"}
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

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="payroll">Payroll Officer</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
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
                  {formData.employmentType === "full-time" ? (
                    <>
                      <Label htmlFor="salary">Basic Salary</Label>
                      <Input
                        id="salary"
                        type="number"
                        value={formData.salary}
                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                        placeholder="0.00"
                      />
                    </>
                  ) : (
                    <>
                      <Label htmlFor="payPerHour">Pay Per Hour</Label>
                      <Input
                        id="payPerHour"
                        type="number"
                        value={formData.payPerHour}
                        onChange={(e) => setFormData({ ...formData, payPerHour: e.target.value })}
                        placeholder="0.00"
                      />
                    </>
                  )}
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

              {/* Allowances Selection */}
              <div className="space-y-2">
                <Label>Allowances</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.selectedAllowances.map(id => {
                    const allowance = allowances?.find((a: any) => a.id === id)
                    return (
                      <Badge key={id} variant="secondary" className="flex items-center gap-1">
                        {allowance?.name || "Unknown"}
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-destructive"
                          onClick={() => toggleAllowance(id)}
                        />
                      </Badge>
                    )
                  })}
                </div>
                <Select onValueChange={toggleAllowance}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add Allowance" />
                  </SelectTrigger>
                  <SelectContent>
                    {allowances?.filter((a: any) => !formData.selectedAllowances.includes(a.id)).map((allowance: any) => (
                      <SelectItem key={allowance.id} value={allowance.id}>
                        {allowance.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Deductions Selection */}
              <div className="space-y-2">
                <Label>Deductions</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.selectedDeductions.map(id => {
                    const deduction = deductions?.find((d: any) => d.id === id)
                    return (
                      <Badge key={id} variant="secondary" className="flex items-center gap-1">
                        {deduction?.name || "Unknown"}
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-destructive"
                          onClick={() => toggleDeduction(id)}
                        />
                      </Badge>
                    )
                  })}
                </div>
                <Select onValueChange={toggleDeduction}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add Deduction" />
                  </SelectTrigger>
                  <SelectContent>
                    {deductions?.filter((d: any) => !formData.selectedDeductions.includes(d.id)).map((deduction: any) => (
                      <SelectItem key={deduction.id} value={deduction.id}>
                        {deduction.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{staff ? "Update" : "Create"} Employee</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
