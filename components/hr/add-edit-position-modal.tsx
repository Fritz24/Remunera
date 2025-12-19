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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AddEditPositionModalProps {
  isOpen: boolean
  onClose: () => void
  position?: any
}

export function AddEditPositionModal({ isOpen, onClose, position }: AddEditPositionModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    selectedAllowance: "", // New field for selected allowance
  })

  const fetcher = (url: string) => fetch(url).then((res) => res.json())
  const { data: allowances, error: allowancesError } = useSWR("/api/payroll/allowances", fetcher)

  useEffect(() => {
    if (position) {
      setFormData({
        title: position.title,
        description: position.description || "",
        selectedAllowance: position.position_allowance?.[0]?.allowance?.id || "no-allowance", // Initialize with existing allowance or 'no-allowance'
      })
    } else {
      setFormData({ title: "", description: "", selectedAllowance: "no-allowance" })
    }
  }, [position])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const method = position ? "PUT" : "POST"
    const url = "/api/hr/positions"
    const payload: any = {
      title: formData.title,
      description: formData.description,
    }

    if (formData.selectedAllowance && formData.selectedAllowance !== "no-allowance") {
      payload.allowance_id = formData.selectedAllowance
    }

    if (position) {
      payload.id = position.id
    }

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save position")
      }

      onClose()
      // Optionally show a toast notification for success
      // toast.success(position ? "Position updated successfully!" : "Position created successfully!")
    } catch (error) {
      console.error("Error saving position:", error)
      alert("Failed to save position: " + (error as Error).message)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{position ? "Edit Position" : "Add New Position"}</DialogTitle>
          <DialogDescription>
            {position ? "Update position information" : "Create a new job position"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Position Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Professor"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="allowances">Allowance</Label>
            <Select
              value={formData.selectedAllowance}
              onValueChange={(value) => setFormData({ ...formData, selectedAllowance: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select allowance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-allowance">None</SelectItem>
                {allowances?.map((allowance: any) => (
                  <SelectItem key={allowance.id} value={allowance.id}>
                    {allowance.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the position"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{position ? "Update" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
