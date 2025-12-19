"use client"

import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { UploadCloud } from "lucide-react"
import { toast } from "sonner"

interface AttendanceCsvUploadProps {
  onUploadSuccess: (data: any[]) => void
  month: string
  year: string
}

export function AttendanceCsvUpload({ onUploadSuccess, month, year }: AttendanceCsvUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a CSV file to upload.")
      return
    }
    if (!month || month === "all" || !year || year === "all") {
      toast.error("Please select a valid month and year for attendance upload.")
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("month", month)
    formData.append("year", year)

    try {
      const response = await fetch("/api/payroll/attendance/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to upload attendance CSV.")
      }

      const result = await response.json()
      onUploadSuccess(result.processedData)
      toast.success("Attendance data uploaded and processed successfully!")
    } catch (error) {
      console.error("Error uploading CSV:", error)
      toast.error(`Error uploading CSV: ${(error as Error).message}`)
    } finally {
      setLoading(false)
      setFile(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Label htmlFor="attendance-csv" className="sr-only">Attendance CSV</Label>
        <Input
          id="attendance-csv"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="flex-1"
        />
        <Button onClick={handleUpload} disabled={!file || loading || month === "all" || year === "all"}>
          {loading ? "Uploading..." : <><UploadCloud className="mr-2 h-4 w-4" /> Upload CSV</>}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Expected CSV format: <code className="font-mono text-xs">Staff Number,Name,Position,Hours Present,Hours Absent,Overtime</code>
      </p>
      <p className="text-xs text-muted-foreground">
        Ensure 'Name' matches staff's first and last names in the system.
      </p>
    </div>
  )
}
