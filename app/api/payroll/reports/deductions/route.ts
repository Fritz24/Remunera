import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const month = searchParams.get("month")
  const year = searchParams.get("year")

  if (!month || month === "all" || !year || year === "all") {
    return NextResponse.json({ error: "Month and year are required for Deductions Report." }, { status: 400 })
  }

  try {
    const { data: payslips, error: payslipsError } = await supabase
      .from("payslip")
      .select(
        `
        id,
        staff(first_name, last_name),
        payslip_details(type, name, amount)
        `
      )
      .eq("month", parseInt(month))
      .eq("year", parseInt(year))

    if (payslipsError) {
      console.error("Error fetching payslips for deductions report:", payslipsError)
      throw new Error(payslipsError.message)
    }

    const deductionSummary: { [key: string]: { totalAmount: number; staffCount: number } } = {}
    const staffDeductions: { [key: string]: { staffName: string; deductions: { name: string; amount: number }[] } } = {}

    payslips.forEach((payslip: any) => {
      const staffName = `${payslip.staff.first_name} ${payslip.staff.last_name}`
      if (!staffDeductions[staffName]) {
        staffDeductions[staffName] = { staffName, deductions: [] }
      }

      payslip.payslip_details.forEach((detail: any) => {
        if (detail.type === "deduction") {
          if (!deductionSummary[detail.name]) {
            deductionSummary[detail.name] = { totalAmount: 0, staffCount: 0 }
          }
          deductionSummary[detail.name].totalAmount += detail.amount
          deductionSummary[detail.name].staffCount += 1 // This counts how many payslips had this deduction

          staffDeductions[staffName].deductions.push({
            name: detail.name,
            amount: detail.amount,
          })
        }
      })
    })

    const formattedSummary = Object.entries(deductionSummary).map(([name, data]) => ({
      name,
      ...data,
    }))

    const formattedStaffDeductions = Object.values(staffDeductions)

    return NextResponse.json({ summary: formattedSummary, details: formattedStaffDeductions })
  } catch (error) {
    console.error("Error generating Deductions Report:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

