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
      staff_deduction(deduction(id, name)),
      staff_allowance(allowance(id, name)),
      profiles:user_id(role)
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

  // Auto-generate staff_number if not provided
  let staffNumber = body.staff_number
  if (!staffNumber) {
    // Get the highest staff number to avoid duplicates
    const { data: existingStaff } = await supabase
      .from("staff")
      .select("staff_number")
      .order("staff_number", { ascending: false })
      .limit(1)

    let nextNumber = 1
    if (existingStaff && existingStaff.length > 0) {
      // Extract number from format "EMP0001"
      const lastNumber = existingStaff[0].staff_number
      const match = lastNumber.match(/\d+/)
      if (match) {
        nextNumber = parseInt(match[0]) + 1
      }
    }

    staffNumber = `EMP${String(nextNumber).padStart(4, "0")}`
  }

  const { data: staffData, error: staffError } = await supabase.from("staff").insert({
    user_id: body.user_id,
    staff_number: staffNumber,
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
    hourly_rate: body.pay_per_hour !== undefined ? body.pay_per_hour : null,
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

  // Handle Allowances
  if (body.allowance_ids && Array.isArray(body.allowance_ids)) {
    // Delete existing
    await supabase.from("staff_allowance").delete().eq("staff_id", staffData.id)

    if (body.allowance_ids.length > 0) {
      // Fetch default amounts
      const { data: allowances } = await supabase
        .from("allowance")
        .select("id, amount")
        .in("id", body.allowance_ids)

      if (allowances) {
        const allowanceInserts = allowances.map(a => ({
          staff_id: staffData.id,
          allowance_id: a.id,
          amount: a.amount || 0
        }))

        const { error: insertError } = await supabase.from("staff_allowance").insert(allowanceInserts)
        if (insertError) console.error("Error inserting allowances:", insertError)
      }
    }
  }

  // Handle Deductions
  if (body.deduction_ids && Array.isArray(body.deduction_ids)) {
    // Delete existing
    await supabase.from("staff_deduction").delete().eq("staff_id", staffData.id)

    if (body.deduction_ids.length > 0) {
      // Fetch default amounts
      const { data: deductions } = await supabase
        .from("deduction")
        .select("id, amount")
        .in("id", body.deduction_ids)

      if (deductions) {
        const deductionInserts = deductions.map(d => ({
          staff_id: staffData.id,
          deduction_id: d.id,
          amount: d.amount || 0
        }))

        const { error: insertError } = await supabase.from("staff_deduction").insert(deductionInserts)
        if (insertError) console.error("Error inserting deductions:", insertError)
      }
    }
  } else if (body.deduction_id) {
    // Legacy support for single deduction_id (if needed, or just migrate UI)
    // We will migrate UI to use deduction_ids array, so this block might be redundant 
    // but kept for backward compatibility if UI isn't fully updated yet.
    // Actually, let's assume we update UI to send arrays.
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
    const { data: existingSalary } = await supabase
      .from("salary_structure")
      .select("id")
      .eq("staff_id", body.id)
      .single()

    if (existingSalary) {
      await supabase.from("salary_structure").update({
        basic_salary: body.salary,
        effective_date: body.hire_date,
      }).eq("staff_id", body.id)
    } else {
      await supabase.from("salary_structure").insert({
        staff_id: body.id,
        basic_salary: body.salary,
        effective_date: body.hire_date,
      })
    }
  }

  // Handle Allowances (Same logic as POST)
  if (body.allowance_ids && Array.isArray(body.allowance_ids)) {
    await supabase.from("staff_allowance").delete().eq("staff_id", body.id)

    if (body.allowance_ids.length > 0) {
      const { data: allowances } = await supabase
        .from("allowance")
        .select("id, amount")
        .in("id", body.allowance_ids)

      if (allowances) {
        const allowanceInserts = allowances.map(a => ({
          staff_id: body.id,
          allowance_id: a.id,
          amount: a.amount || 0
        }))
        await supabase.from("staff_allowance").insert(allowanceInserts)
      }
    }
  }

  // Handle Deductions (Same logic as POST)
  if (body.deduction_ids && Array.isArray(body.deduction_ids)) {
    await supabase.from("staff_deduction").delete().eq("staff_id", body.id)

    if (body.deduction_ids.length > 0) {
      const { data: deductions } = await supabase
        .from("deduction")
        .select("id, amount")
        .in("id", body.deduction_ids)

      if (deductions) {
        const deductionInserts = deductions.map(d => ({
          staff_id: body.id,
          deduction_id: d.id,
          amount: d.amount || 0
        }))
        await supabase.from("staff_deduction").insert(deductionInserts)
      }
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
