import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const month = searchParams.get("month")
  const year = searchParams.get("year")

  if (!month || month === "all" || !year || year === "all") {
    return NextResponse.json({ error: "Month and year are required for Allowances Report." }, { status: 400 })
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
      console.error("Error fetching payslips for allowances report:", payslipsError)
      throw new Error(payslipsError.message)
    }

    const allowanceSummary: { [key: string]: { totalAmount: number; staffCount: number } } = {}
    const staffAllowances: { [key: string]: { staffName: string; allowances: { name: string; amount: number }[] } } = {}

    payslips.forEach((payslip: any) => {
      const staffName = `${payslip.staff.first_name} ${payslip.staff.last_name}`
      if (!staffAllowances[staffName]) {
        staffAllowances[staffName] = { staffName, allowances: [] }
      }

      payslip.payslip_details.forEach((detail: any) => {
        if (detail.type === "allowance") {
          if (!allowanceSummary[detail.name]) {
            allowanceSummary[detail.name] = { totalAmount: 0, staffCount: 0 }
          }
          allowanceSummary[detail.name].totalAmount += detail.amount
          allowanceSummary[detail.name].staffCount += 1 // This counts how many payslips had this allowance

          staffAllowances[staffName].allowances.push({
            name: detail.name,
            amount: detail.amount,
          })
        }
      })
    })

    const formattedSummary = Object.entries(allowanceSummary).map(([name, data]) => ({
      name,
      ...data,
    }))

    const formattedStaffAllowances = Object.values(staffAllowances)

    return NextResponse.json({ summary: formattedSummary, details: formattedStaffAllowances })
  } catch (error) {
    console.error("Error generating Allowances Report:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

