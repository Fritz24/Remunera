import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { parse } from "csv-parse/sync"

export async function POST(request: Request) {
  const supabase = await createClient(true) // Use admin client for sensitive operations
  const formData = await request.formData()
  const file = formData.get("file") as File
  const month = formData.get("month") as string
  const year = formData.get("year") as string

  if (!file) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 })
  }

  if (!file.name.endsWith(".csv")) {
    return NextResponse.json({ error: "Only CSV files are allowed." }, { status: 400 })
  }

  if (!month || month === "all" || !year || year === "all") {
    return NextResponse.json({ error: "Month and year are required for attendance upload." }, { status: 400 })
  }

  try {
    const buffer = await file.arrayBuffer()
    const text = new TextDecoder("utf-8").decode(buffer)
    const records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })

    const parsedMonth = parseInt(month)
    const parsedYear = parseInt(year)

    // 1. Find or Create a payroll_run for the specified month and year
    let { data: payrollRun, error: payrollRunError } = await supabase
      .from("payroll_run")
      .select("id, total_gross, total_deductions, total_net")
      .eq("month", parsedMonth)
      .eq("year", parsedYear)
      .single()

    if (payrollRunError && payrollRunError.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error("Error fetching payroll run:", payrollRunError)
      throw new Error(payrollRunError.message)
    }

    if (!payrollRun) {
      const { data: user } = await supabase.auth.getUser() // Get current user for processed_by
      const { data: newPayrollRun, error: newPayrollRunError } = await supabase
        .from("payroll_run")
        .insert({
          month: parsedMonth,
          year: parsedYear,
          status: "draft", // Start as draft, update later
          processed_by: user?.user?.id, // Link to the user who uploaded
          processed_at: new Date().toISOString(),
        })
        .select("id, total_gross, total_deductions, total_net")
        .single()

      if (newPayrollRunError) {
        console.error("Error creating new payroll run:", newPayrollRunError)
        throw new Error(newPayrollRunError.message)
      }
      payrollRun = newPayrollRun
    }

    const processedData = []
    const payslipDetailsToInsert = []
    let overallGrossPay = payrollRun.total_gross || 0
    let overallDeductions = payrollRun.total_deductions || 0
    let overallNetSalary = payrollRun.total_net || 0

    for (const record of records) {
      const staffNumber = record["Staff Number"]
      const staffName = record.Name
      const positionTitle = record.Position
      const hoursPresent = parseFloat(record["Hours Present"])
      const hoursAbsent = parseFloat(record["Hours Absent"])
      const overtimeHours = parseFloat(record.Overtime)

      let query = supabase
        .from("staff")
        .select(
          `
          id,
          staff_number,
          first_name,
          last_name,
          hourly_rate,
          employment_status,
          position(title),
          staff_deduction(amount, deduction(id, name, amount)),
          staff_allowance(amount, allowance(id, name, amount)),
          salary_structure(basic_salary)
          `
        )

      if (staffNumber) {
        query = query.eq("staff_number", staffNumber)
      } else {
        query = query
          .ilike("first_name", `%${staffName.split(' ')[0]}%`)
          .ilike("last_name", `%${staffName.split(' ')[1]}%`)
      }

      const { data: staffData, error: staffError } = await query.limit(1).maybeSingle()

      if (staffError || !staffData) {
        console.error(`Error fetching staff data for ${staffName || staffNumber}:`, staffError?.message || "Staff not found")
        processedData.push({
          Name: staffName || "Unknown",
          Position: positionTitle || "Unknown",
          "Hours Present": hoursPresent,
          "Hours Absent": hoursAbsent,
          Overtime: overtimeHours,
          Deductions: "Error",
          "Net Salary": "Error",
          Actions: "",
          error: staffError?.message || "Staff not found or data incomplete",
        })
        continue
      }

      // Calculate gross pay
      let basicSalary = 0
      let grossPay = 0

      if (staffData.employment_status === "full-time") {
        basicSalary = staffData.salary_structure?.[0]?.basic_salary || 0
        // For full-time, we might still track hours but pay is based on basic salary
        // Or we might calculate based on hours if that's the policy. 
        // Assuming basic salary is the base for full-time.
        grossPay = basicSalary
      } else {
        const hourlyRate = staffData.hourly_rate || 0
        grossPay = (hoursPresent * hourlyRate) + (overtimeHours * hourlyRate * 1.5)
      }

      // Calculate total deductions for this staff member
      let totalDeductionsForStaff = 0
      const deductionNames: string[] = []
      const currentDeductionDetails = []

      if (staffData.staff_deduction && staffData.staff_deduction.length > 0) {
        for (const sd of staffData.staff_deduction) {
          if (sd.deduction) {
            totalDeductionsForStaff += sd.deduction.amount || 0
            deductionNames.push(`${sd.deduction.name} (FCFA ${sd.deduction.amount})`)
            currentDeductionDetails.push({
              type: "deduction",
              name: sd.deduction.name,
              amount: sd.deduction.amount,
            })
          }
        }
      }

      // Calculate total allowances for this staff member
      let totalAllowancesForStaff = 0
      const allowanceNames: string[] = []
      const currentAllowanceDetails = []

      if (staffData.staff_allowance && staffData.staff_allowance.length > 0) {
        for (const sa of staffData.staff_allowance) {
          if (sa.allowance) {
            totalAllowancesForStaff += sa.amount || 0
            allowanceNames.push(`${sa.allowance.name} (FCFA ${sa.amount})`)
            currentAllowanceDetails.push({
              type: "allowance",
              name: sa.allowance.name,
              amount: sa.amount,
            })
          }
        }
      }

      const netPay = (grossPay + totalAllowancesForStaff) - totalDeductionsForStaff

      // 2. Persist Attendance Data
      const { data: existingAttendance, error: fetchAttendanceError } = await supabase
        .from("attendance")
        .select("id")
        .eq("staff_id", staffData.id)
        .eq("month", parsedMonth)
        .eq("year", parsedYear)
        .maybeSingle()

      if (fetchAttendanceError) {
        console.error(`Error fetching existing attendance for ${staffData.first_name}:`, fetchAttendanceError)
        throw new Error(fetchAttendanceError.message)
      }

      if (existingAttendance) {
        const { error: updateAttendanceError } = await supabase
          .from("attendance")
          .update({
            days_present: hoursPresent,
            days_absent: hoursAbsent,
            overtime_hours: overtimeHours,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingAttendance.id)

        if (updateAttendanceError) {
          console.error(`Error updating attendance for ${staffData.first_name}:`, updateAttendanceError)
          throw new Error(updateAttendanceError.message)
        }
      } else {
        const { error: insertAttendanceError } = await supabase
          .from("attendance")
          .insert({
            staff_id: staffData.id,
            month: parsedMonth,
            year: parsedYear,
            days_present: hoursPresent,
            days_absent: hoursAbsent,
            overtime_hours: overtimeHours,
          })
        if (insertAttendanceError) {
          console.error(`Error inserting attendance for ${staffData.first_name}:`, insertAttendanceError)
          throw new Error(insertAttendanceError.message)
        }
      }


      // 3. Generate and Persist Payslips
      const { data: newPayslip, error: payslipInsertError } = await supabase
        .from("payslip")
        .insert({
          payroll_run_id: payrollRun.id,
          staff_id: staffData.id,
          month: parsedMonth,
          year: parsedYear,
          basic_salary: basicSalary,
          total_allowances: totalAllowancesForStaff,
          total_deductions: totalDeductionsForStaff,
          gross_pay: grossPay + totalAllowancesForStaff,
          net_pay: netPay,
          status: "pending",
          payment_date: null,
        })
        .select("id")
        .single()

      if (payslipInsertError) {
        console.error(`Error inserting payslip for ${staffData.first_name}:`, payslipInsertError)
        throw new Error(payslipInsertError.message)
      }

      // 4. Persist Payslip Details
      currentDeductionDetails.forEach(detail => {
        payslipDetailsToInsert.push({
          payslip_id: newPayslip.id,
          type: detail.type,
          name: detail.name,
          amount: detail.amount,
        })
      })
      currentAllowanceDetails.forEach(detail => {
        payslipDetailsToInsert.push({
          payslip_id: newPayslip.id,
          type: detail.type,
          name: detail.name,
          amount: detail.amount,
        })
      })

      processedData.push({
        Name: `${staffData.first_name} ${staffData.last_name}`,
        Position: staffData.position?.title || positionTitle,
        "Hours Present": hoursPresent,
        "Hours Absent": hoursAbsent,
        Overtime: overtimeHours,
        Deductions: deductionNames.join(', ') || "None",
        "Net Salary": netPay.toFixed(2),
        Actions: "",
      })

      // Update overall totals for payroll run
      overallGrossPay += grossPay + totalAllowancesForStaff
      overallDeductions += totalDeductionsForStaff
      overallNetSalary += netPay
    }

    // Insert all payslip details in one go
    if (payslipDetailsToInsert.length > 0) {
      const { error: batchDetailsError } = await supabase.from("payslip_details").insert(payslipDetailsToInsert)
      if (batchDetailsError) {
        console.error("Error inserting payslip details:", batchDetailsError)
        throw new Error(batchDetailsError.message)
      }
    }

    // 5. Update payroll_run totals
    const { error: updateRunError } = await supabase
      .from("payroll_run")
      .update({
        total_gross: overallGrossPay,
        total_deductions: overallDeductions,
        total_net: overallNetSalary,
        status: "approved",
      })
      .eq("id", payrollRun.id)

    if (updateRunError) {
      console.error("Error updating payroll run totals:", updateRunError)
      throw new Error(updateRunError.message)
    }

    return NextResponse.json({ success: true, processedData }, { status: 200 })
  } catch (error) {
    console.error("CSV processing and persistence error:", error)
    return NextResponse.json({ error: "Failed to process CSV file and persist data." }, { status: 500 })
  }
}
