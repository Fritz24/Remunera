export type UserRole = "admin" | "hr" | "payroll" | "staff"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

export interface Staff {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  employmentType: "full-time" | "part-time" | "contract"
  staffType: string
  department: string
  position: string
  hireDate: string
  salary: number
  status: "active" | "inactive"
}

export interface Department {
  id: string
  name: string
  code: string
  description: string
}

export interface Position {
  id: string
  title: string
  department: string
  description: string
}

export interface Allowance {
  id: string
  name: string
  type: "fixed" | "percentage"
  amount: number
  description: string
}

export interface Deduction {
  id: string
  name: string
  type: "fixed" | "percentage"
  amount: number
  description: string
}

export interface PayrollRun {
  id: string
  period: string
  month: string
  year: number
  status: "draft" | "processing" | "completed"
  totalGross: number
  totalDeductions: number
  totalNet: number
  createdAt: string
}

export interface Payslip {
  id: string
  staffId: string
  staffName: string
  period: string
  basicSalary: number
  allowances: Array<{ name: string; amount: number }>
  deductions: Array<{ name: string; amount: number }>
  grossPay: number
  netPay: number
  status: "draft" | "approved" | "paid"
  generatedAt: string
}

export interface StaffType {
  id: string
  name: string
  description: string
}
