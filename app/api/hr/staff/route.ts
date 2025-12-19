import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("staff")
    .select(
      `
      *,
      position:position_id(id, title),
      salary_structure(basic_salary),
      staff_deduction(deduction(id, name))
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

  const { data: staffData, error: staffError } = await supabase.from("staff").insert({
    user_id: body.user_id,
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
    position_id: body.position_id,
    hire_date: body.hire_date,
    employment_status: body.employment_status,
    bank_name: body.bank_name,
    account_number: body.account_number,
    bank_code: body.bank_code,
    tax_id: body.tax_id,
    hourly_rate: body.employment_status === "part-time" ? body.pay_per_hour : null,
  }).select().single()

  if (staffError) {
    return NextResponse.json({ error: staffError.message }, { status: 500 })
  }

  if (body.employment_status === "full-time" && body.salary) {
    const { error: salaryError } = await supabase.from("salary_structure").insert({
      staff_id: staffData.id,
      basic_salary: body.salary,
      effective_date: body.hire_date,
    })
    if (salaryError) {
      return NextResponse.json({ error: salaryError.message }, { status: 500 })
    }
  }

  if (body.deduction_id) {
    const { error: staffDeductionError } = await supabase.from("staff_deduction").insert({
      staff_id: staffData.id,
      deduction_id: body.deduction_id,
      amount: 0, // Default amount, can be updated later
    })
    if (staffDeductionError) {
      return NextResponse.json({ error: staffDeductionError.message }, { status: 500 })
    }
  }

  return NextResponse.json(staffData)
}

export async function PUT(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  const { data: staffData, error: staffError } = await supabase.from("staff").update({
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
    position_id: body.position_id,
    hire_date: body.hire_date,
    employment_status: body.employment_status,
    bank_name: body.bank_name,
    account_number: body.account_number,
    bank_code: body.bank_code,
    tax_id: body.tax_id,
    hourly_rate: body.employment_status === "part-time" ? body.pay_per_hour : null,
  }).eq("id", body.id).select().single()

  if (staffError) {
    return NextResponse.json({ error: staffError.message }, { status: 500 })
  }

  if (body.employment_status === "full-time" && body.salary) {
    const { data: existingSalary, error: fetchError } = await supabase
      .from("salary_structure")
      .select("id")
      .eq("staff_id", body.id)
      .single()

    if (fetchError && fetchError.code !== "PGRST116") { // PGRST116 means no rows found
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (existingSalary) {
      const { error: updateSalaryError } = await supabase.from("salary_structure").update({
        basic_salary: body.salary,
        effective_date: body.hire_date,
      }).eq("staff_id", body.id)

      if (updateSalaryError) {
        return NextResponse.json({ error: updateSalaryError.message }, { status: 500 })
      }
    } else {
      const { error: insertSalaryError } = await supabase.from("salary_structure").insert({
        staff_id: body.id,
        basic_salary: body.salary,
        effective_date: body.hire_date,
      })
      if (insertSalaryError) {
        return NextResponse.json({ error: insertSalaryError.message }, { status: 500 })
      }
    }
  }

  // Handle deductions for existing staff
  if (body.deduction_id) {
    // First, check if a staff_deduction entry already exists for this staff member
    const { data: existingDeduction, error: fetchDeductionError } = await supabase
      .from("staff_deduction")
      .select("id")
      .eq("staff_id", body.id)
      .single()

    if (fetchDeductionError && fetchDeductionError.code !== "PGRST116") {
      return NextResponse.json({ error: fetchDeductionError.message }, { status: 500 })
    }

    if (existingDeduction) {
      // If exists, update it
      const { error: updateDeductionError } = await supabase.from("staff_deduction").update({
        deduction_id: body.deduction_id,
      }).eq("staff_id", body.id)

      if (updateDeductionError) {
        return NextResponse.json({ error: updateDeductionError.message }, { status: 500 })
      }
    } else {
      // If not exists, insert new
      const { error: insertDeductionError } = await supabase.from("staff_deduction").insert({
        staff_id: body.id,
        deduction_id: body.deduction_id,
        amount: 0, // Default amount, can be updated later
      })
      if (insertDeductionError) {
        return NextResponse.json({ error: insertDeductionError.message }, { status: 500 })
      }
    }
  } else {
    // If no deduction_id is provided, delete any existing staff_deduction for this staff member
    const { error: deleteDeductionError } = await supabase.from("staff_deduction").delete().eq("staff_id", body.id)
    if (deleteDeductionError && deleteDeductionError.code !== "PGRST116") {
      return NextResponse.json({ error: deleteDeductionError.message }, { status: 500 })
    }
  }

  return NextResponse.json(staffData)
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
