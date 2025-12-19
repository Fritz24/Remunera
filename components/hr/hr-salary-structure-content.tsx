"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AttendanceCsvUpload } from "@/components/payroll/AttendanceCsvUpload"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"

interface FullTimeSalaryData {
  id: string;
  name: string;
  position: string;
  basic_salary: number;
  allowances: string;
  total_allowances: number;
  deductions: string;
  total_deductions: number;
  net_pay: number;
}

const fetcher = async (url: string) => {
  const supabase = createClient()
  const { data, error } = await supabase.from(url.split('/')[url.split('/').length - 1]).select('*')
  if (error) throw error
  return data
}

const fullTimeSalaryFetcher = async ([url, month, year]: [string, string, string]) => {
  const res = await fetch(`${url}?month=${month}&year=${year}`)
  if (!res.ok) {
    throw new Error("Failed to fetch full-time salary data")
  }
  return res.json()
}

export function HrSalaryStructureContent() {
  const [partTimeSalaryData, setPartTimeSalaryData] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const currentYear = new Date().getFullYear()
  const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString())
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString())

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: new Date(0, i).toLocaleString("en-US", { month: "long" }),
  }))
  months.unshift({ value: "all", label: "All Months" })

  const years = Array.from({ length: 5 }, (_, i) => ({
    value: (currentYear - i).toString(),
    label: (currentYear - i).toString(),
  }))
  years.unshift({ value: "all", label: "All Years" })

  const { data: fullTimeSalaryRaw, error: fullTimeError, isLoading: fullTimeLoading } = useSWR<FullTimeSalaryData[]>(
    ["/api/payroll/salary/full-time", selectedMonth, selectedYear],
    fullTimeSalaryFetcher
  )

  const handleUploadSuccess = (data: any[]) => {
    setPartTimeSalaryData(data)
  }

  const filteredPartTimeData = partTimeSalaryData.filter((data) =>
    data.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    data.Position.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredFullTimeData = fullTimeSalaryRaw?.filter((data) =>
    data.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    data.position.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Salary Structure</h2>
        <p className="text-muted-foreground">Configure and manage staff salary structures</p>
      </div>

      <Tabs defaultValue="full-time" className="space-y-4">
        <TabsList>
          <TabsTrigger value="full-time">Full-Time</TabsTrigger>
          <TabsTrigger value="part-time">Part-Time</TabsTrigger>
        </TabsList>

        <TabsContent value="full-time" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Full-Time Staff Salary Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <Input
                  placeholder="Search by name or position..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year.value} value={year.value}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Base Salary</TableHead>
                    <TableHead>Allowances</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Salary</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fullTimeLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        Loading full-time salary data...
                      </TableCell>
                    </TableRow>
                  ) : filteredFullTimeData.length > 0 ? (
                    filteredFullTimeData.map((staff) => (
                      <TableRow key={staff.id}>
                        <TableCell className="font-medium">{staff.name}</TableCell>
                        <TableCell>{staff.position}</TableCell>
                        <TableCell>${staff.basic_salary.toLocaleString()}</TableCell>
                        <TableCell>{staff.allowances}</TableCell>
                        <TableCell>{staff.deductions}</TableCell>
                        <TableCell className="font-bold">${staff.net_pay.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{/* Actions */}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No full-time salary data available for the selected period.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="part-time" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Part-Time Staff Attendance & Salary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <Input
                  placeholder="Search by name or position..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year.value} value={year.value}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="mb-4">
                <AttendanceCsvUpload onUploadSuccess={handleUploadSuccess} month={selectedMonth} year={selectedYear} />
                <p className="text-muted-foreground">Upload attendance CSV for part-time staff.</p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Hours Present</TableHead>
                    <TableHead>Hours Absent</TableHead>
                    <TableHead>Overtime</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Salary</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPartTimeData.length > 0 ? (
                    filteredPartTimeData.map((data, index) => (
                      <TableRow key={index}>
                        <TableCell>{data.Name}</TableCell>
                        <TableCell>{data.Position}</TableCell>
                        <TableCell>{data["Hours Present"]}</TableCell>
                        <TableCell>{data["Hours Absent"]}</TableCell>
                        <TableCell>{data.Overtime}</TableCell>
                        <TableCell>{data.Deductions}</TableCell>
                        <TableCell>{data["Net Salary"]}</TableCell>
                        <TableCell className="text-right">{/* Actions */}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        No part-time salary data available. Upload a CSV to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

