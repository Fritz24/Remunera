"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AddEditAllowanceModalProps {
  isOpen: boolean
  onClose: () => void
  allowance?: any
}

export function AddEditAllowanceModal({ isOpen, onClose, allowance }: AddEditAllowanceModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    description: "",
  })

  useEffect(() => {
    if (allowance) {
      setFormData({
        name: allowance.name,
        amount: allowance.amount.toString(),
        description: allowance.description || "",
      })
    } else {
      setFormData({ name: "", amount: "", description: "" })
    }
  }, [allowance])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const method = allowance ? "PUT" : "POST"
    const url = "/api/payroll/allowances"
    const payload = {
      name: formData.name,
      amount: parseFloat(formData.amount),
      description: formData.description,
    }

    if (allowance) {
      // @ts-ignore
      payload.id = allowance.id
    }

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save allowance")
      }

      onClose()
      // toast.success(allowance ? "Allowance updated successfully!" : "Allowance created successfully!")
    } catch (error) {
      console.error("Error saving allowance:", error)
      alert("Failed to save allowance: " + (error as Error).message)
    }
  }

  return (
    <Dialog open={isOpen} onOncahnge={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{allowance ? "Edit Allowance" : "Add New Allowance"}</DialogTitle>
          <DialogDescription>
            {allowance ? "Update allowance information" : "Create a new salary allowance"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Allowance Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Housing Allowance"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the allowance"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{allowance ? "Update" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
