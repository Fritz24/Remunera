import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const month = searchParams.get("month")
  const year = searchParams.get("year")

  if (!month || month === "all" || !year || year === "all") {
    return NextResponse.json({ error: "Month and year are required for Monthly Payroll Summary." }, { status: 400 })
  }

  try {
    // Fetch the payroll run for the specified month and year
    const { data: payrollRun, error: payrollRunError } = await supabase
      .from("payroll_run")
      .select("id, month, year, total_gross, total_deductions, total_net, status, processed_at")
      .eq("month", parseInt(month))
      .eq("year", parseInt(year))
      .single()

    if (payrollRunError && payrollRunError.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error("Error fetching payroll run:", payrollRunError)
      throw new Error(payrollRunError.message)
    }

    if (!payrollRun) {
      return NextResponse.json({ message: "No payroll run found for the selected period." }, { status: 200 })
    }

    // Fetch detailed payslips for this payroll run
    const { data: payslips, error: payslipsError } = await supabase
      .from("payslip")
      .select(
        `
        id,
        basic_salary,
        total_allowances,
        total_deductions,
        gross_pay,
        net_pay,
        status,
        staff(first_name, last_name, position(title)),
        payslip_details(type, name, amount)
        `
      )
      .eq("payroll_run_id", payrollRun.id)

    if (payslipsError) {
      console.error("Error fetching payslip details:", payslipsError)
      throw new Error(payslipsError.message)
    }

    // Aggregate data for the report
    const reportSummary = {
      period: `${new Date(0, parseInt(month) - 1).toLocaleString("en-US", { month: "long" })} ${year}`,
      payrollRunStatus: payrollRun.status,
      overallGrossPay: payrollRun.total_gross,
      overallDeductions: payrollRun.total_deductions,
      overallNetSalary: payrollRun.total_net,
      processedDate: payrollRun.processed_at ? new Date(payrollRun.processed_at).toLocaleDateString() : 'N/A',
      staffPayslips: payslips.map((payslip: any) => ({
        staffName: `${payslip.staff.first_name} ${payslip.staff.last_name}`,
        position: payslip.staff.position?.title || "N/A",
        basicSalary: payslip.basic_salary,
        totalAllowances: payslip.total_allowances,
        totalDeductions: payslip.total_deductions,
        grossPay: payslip.gross_pay,
        netPay: payslip.net_pay,
        status: payslip.status,
        details: payslip.payslip_details,
      })),
    }

    return NextResponse.json(reportSummary)
  } catch (error) {
    console.error("Error generating Monthly Payroll Summary:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

