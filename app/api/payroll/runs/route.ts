import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const month = searchParams.get("month")
  const year = searchParams.get("year")

  let query = supabase
    .from("payroll_run")
    .select(
      `
      id,
      month,
      year,
      status,
      total_gross,
      total_deductions,
      total_net,
      processed_at,
      payslip(status)
      `
    )

  if (month && month !== "all") {
    query = query.eq("month", parseInt(month))
  }
  if (year && year !== "all") {
    query = query.eq("year", parseInt(year))
  }

  const { data: payrollRuns, error } = await query
    .order("year", { ascending: false })
    .order("month", { ascending: false })

  if (error) {
    console.error("Error fetching payroll runs:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const formattedPayrollRuns = await Promise.all(payrollRuns.map(async (run) => {
    const allPayslipsPaidOrApproved = run.payslip.every((p: any) => p.status === "paid" || p.status === "approved")
    const overallStatus = allPayslipsPaidOrApproved ? "complete" : "incomplete"

    // To avoid circular structure issues for NextResponse.json, explicitly create a new object
    const { payslip, ...rest } = run

    return {
      ...rest,
      status: overallStatus,
    }
  }))

  return NextResponse.json(formattedPayrollRuns)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  const { month, year } = body

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Create payroll run
  const { data: payrollRun, error: runError } = await supabase
    .from("payroll_run")
    .insert({
      month,
      year,
      status: "processing",
      processed_by: user?.id,
      processed_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (runError) {
    return NextResponse.json({ error: runError.message }, { status: 500 })
  }

  // Get all active staff with salary structures
  const { data: staffList, error: staffError } = await supabase
    .from("staff")
    .select(
      `
      *,
      salary_structure:salary_structure!inner(basic_salary),
      staff_allowance(allowance_id, amount, allowance:allowance_id(name, is_taxable)),
      staff_deduction(deduction_id, amount, deduction:deduction_id(name))
    `,
    )
    .eq("employment_status", "active")
    .eq("salary_structure.is_active", true)

  if (staffError) {
    return NextResponse.json({ error: staffError.message }, { status: 500 })
  }

  // Generate payslips
  const payslips = []
  let totalGross = 0
  let totalDeductions = 0
  let totalNet = 0

  for (const staff of staffList || []) {
    const basicSalary = staff.salary_structure[0]?.basic_salary || 0
    const allowances = staff.staff_allowance || []
    const deductions = staff.staff_deduction || []

    const totalAllowances = allowances.reduce((sum: number, a: any) => sum + Number.parseFloat(a.amount), 0)
    const totalDeduction = deductions.reduce((sum: number, d: any) => sum + Number.parseFloat(d.amount), 0)
    const grossPay = basicSalary + totalAllowances
    const netPay = grossPay - totalDeduction

    totalGross += grossPay
    totalDeductions += totalDeduction
    totalNet += netPay

    payslips.push({
      payroll_run_id: payrollRun.id,
      staff_id: staff.id,
      month,
      year,
      basic_salary: basicSalary,
      total_allowances: totalAllowances,
      total_deductions: totalDeduction,
      gross_pay: grossPay,
      net_pay: netPay,
      status: "pending",
    })
  }

  const { error: payslipError } = await supabase.from("payslip").insert(payslips)

  if (payslipError) {
    return NextResponse.json({ error: payslipError.message }, { status: 500 })
  }

  // Update payroll run totals
  await supabase
    .from("payroll_run")
    .update({
      total_gross: totalGross,
      total_deductions: totalDeductions,
      total_net: totalNet,
      status: "approved",
    })
    .eq("id", payrollRun.id)

  return NextResponse.json({ success: true, payrollRun, payslipsGenerated: payslips.length })
}
