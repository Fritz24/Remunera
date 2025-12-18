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

  // Get staff record for current user
  const { data: staff } = await supabase.from("staff").select("id").eq("user_id", user.id).single()

  if (!staff) {
    return NextResponse.json({ error: "Staff record not found" }, { status: 404 })
  }

  const { data: payslips, error } = await supabase
    .from("payslip")
    .select(
      `
      *,
      payroll_run:payroll_run_id(status)
    `,
    )
    .eq("staff_id", staff.id)
    .order("year", { ascending: false })
    .order("month", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(payslips)
}
