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

interface AddEditDeductionModalProps {
  isOpen: boolean
  onClose: () => void
  deduction?: any
}

export function AddEditDeductionModal({ isOpen, onClose, deduction }: AddEditDeductionModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    description: "",
  })

  useEffect(() => {
    if (deduction) {
      setFormData({
        name: deduction.name,
        amount: deduction.amount.toString(),
        description: deduction.description || "",
      })
    } else {
      setFormData({ name: "", amount: "", description: "" })
    }
  }, [deduction])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const method = deduction ? "PUT" : "POST"
    const url = "/api/payroll/deductions"
    const payload = {
      name: formData.name,
      amount: parseFloat(formData.amount),
      description: formData.description,
    }

    if (deduction) {
      // @ts-ignore
      payload.id = deduction.id
    }

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save deduction")
      }

      onClose()
      // toast.success(deduction ? "Deduction updated successfully!" : "Deduction created successfully!")
    } catch (error) {
      console.error("Error saving deduction:", error)
      alert("Failed to save deduction: " + (error as Error).message)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{deduction ? "Edit Deduction" : "Add New Deduction"}</DialogTitle>
          <DialogDescription>
            {deduction ? "Update deduction information" : "Create a new salary deduction"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Deduction Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Income Tax"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (FCFA)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="150"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the deduction"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{deduction ? "Update" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
