import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: staffData, error: staffError } = await supabase
      .from("staff")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (staffError) {
      console.error("Error fetching staff ID:", staffError);
      return NextResponse.json({ error: staffError.message }, { status: 500 });
    }

    if (!staffData) {
      return NextResponse.json({ message: "Staff record not found for this user." }, { status: 404 });
    }

    let query = supabase
      .from("payslip")
      .select(
        `
        id,
        month,
        year,
        basic_salary,
        total_allowances,
        total_deductions,
        gross_pay,
        net_pay,
        status,
        payment_date,
        staff(first_name, last_name, position(title))
      `
      )
      .eq("staff_id", staffData.id);

    if (month && month !== "all") {
      query = query.eq("month", parseInt(month));
    }
    if (year && year !== "all") {
      query = query.eq("year", parseInt(year));
    }

    const { data: payslips, error: payslipError } = await query
      .order("year", { ascending: false })
      .order("month", { ascending: false });

    if (payslipError) {
      console.error("Error fetching employee payslips:", payslipError);
      return NextResponse.json({ error: payslipError.message }, { status: 500 });
    }

    return NextResponse.json(payslips, { status: 200 });
  } catch (error) {
    console.error("API staff payslips error:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
