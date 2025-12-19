import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const month = searchParams.get("month")
  const year = searchParams.get("year")

  let query = supabase
    .from("staff")
    .select(
      `
      id,
      first_name,
      last_name,
      employment_status,
      position(title),
      salary_structure!left(basic_salary, effective_date, is_active),
      staff_allowance(amount, allowance(name, is_taxable)),
      staff_deduction(amount, deduction(name))
      `
    )
    .eq("employment_status", "full-time")

  // Optional: Filter by active salary structure for the given period if needed
  // Note: This logic might need refinement based on how you define 'active' salary for a past period.
  // For simplicity, we'll fetch all and filter client-side for now, or refine this query later.

  const { data: staffData, error } = await query

  if (error) {
    console.error("Error fetching full-time staff salary data:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const processedStaffData = staffData.map((staff) => {
    const basicSalaryEntry = staff.salary_structure?.find(
      (ss: any) => ss.is_active && new Date(ss.effective_date).getFullYear() <= parseInt(year || new Date().getFullYear().toString())
    )
    const basic_salary = basicSalaryEntry?.basic_salary || 0

    let totalAllowances = 0
    const allowanceNames: string[] = []
    staff.staff_allowance.forEach((sa: any) => {
      totalAllowances += sa.amount || 0
      if (sa.allowance) allowanceNames.push(`${sa.allowance.name} ($${sa.amount})`)
    })

    let totalDeductions = 0
    const deductionNames: string[] = []
    staff.staff_deduction.forEach((sd: any) => {
      totalDeductions += sd.amount || 0
      if (sd.deduction) deductionNames.push(`${sd.deduction.name} ($${sd.amount})`)
    })

    const grossPay = basic_salary + totalAllowances
    const netPay = grossPay - totalDeductions

    return {
      id: staff.id,
      name: `${staff.first_name} ${staff.last_name}`,
      position: staff.position?.title || "N/A",
      basic_salary: basic_salary,
      allowances: allowanceNames.join(", ") || "None",
      total_allowances: totalAllowances,
      deductions: deductionNames.join(", ") || "None",
      total_deductions: totalDeductions,
      net_pay: netPay,
    }
  })

  // Implement filtering by month and year for full-time if salary_structure also changes per month
  // For now, salary_structure is often annual, so we'll just return all active salaries for the year.

  return NextResponse.json(processedStaffData)
}

