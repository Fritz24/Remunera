"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileSpreadsheet, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function AttendanceUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const { toast } = useToast()

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type === "text/csv") {
      setFile(droppedFile)
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      })
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleUpload = () => {
    if (file) {
      // Placeholder upload logic
      toast({
        title: "Upload successful",
        description: `${file.name} has been uploaded and processed`,
      })
      setFile(null)
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Attendance CSV</CardTitle>
          <CardDescription>Drag and drop your attendance CSV file or click to browse</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative flex min-h-[300px] flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
              isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
            }`}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="absolute inset-0 cursor-pointer opacity-0"
            />

            {file ? (
              <div className="flex flex-col items-center gap-4">
                <FileSpreadsheet className="h-16 w-16 text-primary" />
                <div className="text-center">
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setFile(null)
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Remove
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center">
                <Upload className="h-12 w-12 text-muted-foreground" />
                <p className="text-sm font-medium">Drop your CSV file here or click to browse</p>
                <p className="text-xs text-muted-foreground">Supports CSV files up to 10MB</p>
              </div>
            )}
          </div>

          {file && (
            <div className="mt-4">
              <Button onClick={handleUpload} className="w-full">
                Upload and Process
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>CSV Format Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <p>Your CSV file should include the following columns:</p>
            <ul className="list-inside list-disc space-y-1 text-muted-foreground">
              <li>
                <strong>staff_id</strong>: Employee identification number
              </li>
              <li>
                <strong>name</strong>: Full name of the employee
              </li>
              <li>
                <strong>days_present</strong>: Number of days present
              </li>
              <li>
                <strong>days_absent</strong>: Number of days absent
              </li>
              <li>
                <strong>overtime_hours</strong>: Total overtime hours (optional)
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
