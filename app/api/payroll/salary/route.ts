import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("salary_structure")
    .select(
      `
      *,
      staff:staff_id(id, staff_number, first_name, last_name, department:department_id(name))
    `,
    )
    .eq("is_active", true)
    .order("effective_date", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  // Deactivate previous salary structures for this staff
  await supabase.from("salary_structure").update({ is_active: false }).eq("staff_id", body.staff_id)

  const { data, error } = await supabase
    .from("salary_structure")
    .insert({
      staff_id: body.staff_id,
      basic_salary: body.basic_salary,
      effective_date: body.effective_date,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
