import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("staff")
    .select(
      `
      *,
      staff_type:staff_type_id(id, name),
      department:department_id(id, name, code),
      position:position_id(id, title)
    `,
    )
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from("staff")
    .insert({
      staff_number: body.staff_number,
      first_name: body.first_name,
      middle_name: body.middle_name,
      last_name: body.last_name,
      email: body.email,
      phone: body.phone,
      date_of_birth: body.date_of_birth,
      gender: body.gender,
      address: body.address,
      city: body.city,
      state: body.state,
      zip_code: body.zip_code,
      country: body.country,
      staff_type_id: body.staff_type_id,
      department_id: body.department_id,
      position_id: body.position_id,
      hire_date: body.hire_date,
      employment_status: body.employment_status,
      bank_name: body.bank_name,
      account_number: body.account_number,
      bank_code: body.bank_code,
      tax_id: body.tax_id,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PUT(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from("staff")
    .update({
      first_name: body.first_name,
      middle_name: body.middle_name,
      last_name: body.last_name,
      email: body.email,
      phone: body.phone,
      date_of_birth: body.date_of_birth,
      gender: body.gender,
      address: body.address,
      city: body.city,
      state: body.state,
      zip_code: body.zip_code,
      country: body.country,
      staff_type_id: body.staff_type_id,
      department_id: body.department_id,
      position_id: body.position_id,
      hire_date: body.hire_date,
      employment_status: body.employment_status,
      bank_name: body.bank_name,
      account_number: body.account_number,
      bank_code: body.bank_code,
      tax_id: body.tax_id,
    })
    .eq("id", body.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 })
  }

  const { error } = await supabase.from("staff").delete().eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
