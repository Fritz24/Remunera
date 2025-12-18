import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const month = searchParams.get("month")
  const year = searchParams.get("year")
  const staffId = searchParams.get("staff_id")

  let query = supabase.from("payslip").select(`
      *,
      staff:staff_id(id, staff_number, first_name, last_name, department:department_id(name)),
      payroll_run:payroll_run_id(id, status)
    `)

  if (month) query = query.eq("month", month)
  if (year) query = query.eq("year", year)
  if (staffId) query = query.eq("staff_id", staffId)

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
