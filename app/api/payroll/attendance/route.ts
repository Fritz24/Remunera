import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  const { records, month, year } = body

  const attendanceRecords = records.map((record: any) => ({
    staff_id: record.staff_id,
    month,
    year,
    days_present: record.days_present,
    days_absent: record.days_absent,
    days_on_leave: record.days_on_leave,
    overtime_hours: record.overtime_hours || 0,
  }))

  const { data, error } = await supabase.from("attendance").upsert(attendanceRecords, {
    onConflict: "staff_id,month,year",
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, count: records.length })
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const month = searchParams.get("month")
  const year = searchParams.get("year")

  let query = supabase.from("attendance").select(`
      *,
      staff:staff_id(id, staff_number, first_name, last_name, department:department_id(name))
    `)

  if (month) query = query.eq("month", month)
  if (year) query = query.eq("year", year)

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
