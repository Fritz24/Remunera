import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { format } from "date-fns"

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required." }, { status: 400 });
  }

  try {
    const combinedActivities: any[] = [];

    // 1. Staff Profile Changes (created_at, updated_at on staff table)
    const { data: staffChanges, error: staffError } = await supabase
      .from("staff")
      .select("id, first_name, last_name, created_at, updated_at")
      .eq("user_id", userId)
      .limit(5);

    if (staffError) console.error("Error fetching staff changes for employee dashboard:", staffError);
    staffChanges?.forEach(staff => {
      combinedActivities.push({
        id: `staff_created_${staff.id}`,
        type: "staff_profile",
        description: `Your profile was created on ${format(new Date(staff.created_at), 'PPP')}.`,
        timestamp: staff.created_at,
      });
      if (staff.created_at !== staff.updated_at) {
        combinedActivities.push({
          id: `staff_updated_${staff.id}`,
          type: "staff_profile",
          description: `Your profile details were updated.`, // Could be more specific if diffs were tracked
          timestamp: staff.updated_at,
        });
      }
    });

    // 2. Salary Structure Changes (created_at, updated_at on salary_structure table)
    const { data: salaryChanges, error: salaryError } = await supabase
      .from("salary_structure")
      .select("id, basic_salary, effective_date, created_at, updated_at, staff(user_id)")
      .eq("staff.user_id", userId) // Filter by staff's user_id
      .order("created_at", { ascending: false })
      .limit(5);
    
    if (salaryError) console.error("Error fetching salary changes for employee dashboard:", salaryError);
    salaryChanges?.forEach(salary => {
      combinedActivities.push({
        id: `salary_created_${salary.id}`,
        type: "salary_structure",
        description: `A new salary structure with basic salary ${salary.basic_salary} was set, effective ${format(new Date(salary.effective_date), 'PPP')}.`,
        timestamp: salary.created_at,
      });
      if (salary.created_at !== salary.updated_at) {
        combinedActivities.push({
          id: `salary_updated_${salary.id}`,
          type: "salary_structure",
          description: `Your salary structure (basic salary ${salary.basic_salary}) was updated.`, // Could be more specific
          timestamp: salary.updated_at,
        });
      }
    });

    // 3. Payslip Generation (created_at on payslip table)
    const { data: payslipGenerations, error: payslipGenError } = await supabase
      .from("payslip")
      .select("id, month, year, created_at, staff(user_id)")
      .eq("staff.user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (payslipGenError) console.error("Error fetching payslip generations for employee dashboard:", payslipGenError);
    payslipGenerations?.forEach(payslip => {
      combinedActivities.push({
        id: `payslip_generated_${payslip.id}`,
        type: "payslip_generated",
        description: `Payslip for ${format(new Date(payslip.year, payslip.month - 1), 'MMMM yyyy')} was generated.`, // Could include status if needed
        timestamp: payslip.created_at,
      });
    });

    // Sort all activities by timestamp in descending order and limit
    combinedActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json(combinedActivities.slice(0, 10)); // Limit to top 10 recent changes

  } catch (error) {
    console.error("Error in employee recent changes API:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

