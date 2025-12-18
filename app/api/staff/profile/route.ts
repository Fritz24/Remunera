import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: staff, error } = await supabase
    .from("staff")
    .select(
      `
      *,
      staff_type:staff_type_id(name),
      department:department_id(name, code),
      position:position_id(title),
      salary_structure(basic_salary, effective_date),
      staff_allowance(amount, allowance:allowance_id(name)),
      staff_deduction(amount, deduction:deduction_id(name))
    `,
    )
    .eq("user_id", user.id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(staff)
}
