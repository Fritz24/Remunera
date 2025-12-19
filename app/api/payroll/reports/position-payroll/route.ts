import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const month = searchParams.get("month")
  const year = searchParams.get("year")

  if (!month || month === "all" || !year || year === "all") {
    return NextResponse.json({ error: "Month and year are required for Position Payroll Report." }, { status: 400 })
  }

  try {
    const { data: payslips, error: payslipsError } = await supabase
      .from("payslip")
      .select(
        `
        basic_salary,
        total_allowances,
        total_deductions,
        net_pay,
        staff(position(title))
        `
      )
      .eq("month", parseInt(month))
      .eq("year", parseInt(year))

    if (payslipsError) {
      console.error("Error fetching payslips for position report:", payslipsError)
      throw new Error(payslipsError.message)
    }

    const positionReports: { [key: string]: { totalBasic: number; totalAllowances: number; totalDeductions: number; totalNet: number; staffCount: number } } = {}

    payslips.forEach((payslip: any) => {
      const positionTitle = payslip.staff?.position?.title || "Unassigned"
      if (!positionReports[positionTitle]) {
        positionReports[positionTitle] = {
          totalBasic: 0,
          totalAllowances: 0,
          totalDeductions: 0,
          totalNet: 0,
          staffCount: 0,
        }
      }
      positionReports[positionTitle].totalBasic += payslip.basic_salary
      positionReports[positionTitle].totalAllowances += payslip.total_allowances
      positionReports[positionTitle].totalDeductions += payslip.total_deductions
      positionReports[positionTitle].totalNet += payslip.net_pay
      positionReports[positionTitle].staffCount += 1
    })

    const formattedReports = Object.entries(positionReports).map(([position, data]) => ({
      position,
      ...data,
    }))

    return NextResponse.json(formattedReports)
  } catch (error) {
    console.error("Error generating Position Payroll Report:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

