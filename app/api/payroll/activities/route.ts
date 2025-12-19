import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const supabase = await createClient();

  try {
    const { data: staffActivities, error: staffError } = await supabase
      .from("staff")
      .select("id, first_name, last_name, created_at, updated_at")
      .order("created_at", { ascending: false })
      .limit(5);

    const { data: positionActivities, error: positionError } = await supabase
      .from("position")
      .select("id, title, created_at, updated_at")
      .order("created_at", { ascending: false })
      .limit(5);

    const { data: allowanceActivities, error: allowanceError } = await supabase
      .from("allowance")
      .select("id, name, created_at, updated_at")
      .order("created_at", { ascending: false })
      .limit(5);

    const { data: deductionActivities, error: deductionError } = await supabase
      .from("deduction")
      .select("id, name, created_at, updated_at")
      .order("created_at", { ascending: false })
      .limit(5);

    const { data: payrollRunActivities, error: payrollRunError } = await supabase
      .from("payroll_run")
      .select("id, month, year, created_at, processed_at")
      .order("created_at", { ascending: false })
      .limit(5);

    const { data: payslipActivities, error: payslipError } = await supabase
      .from("payslip")
      .select("id, month, year, created_at, staff(first_name, last_name)")
      .order("created_at", { ascending: false })
      .limit(5);

    if (staffError) console.error("Error fetching staff activities:", staffError);
    if (positionError) console.error("Error fetching position activities:", positionError);
    if (allowanceError) console.error("Error fetching allowance activities:", allowanceError);
    if (deductionError) console.error("Error fetching deduction activities:", deductionError);
    if (payrollRunError) console.error("Error fetching payroll run activities:", payrollRunError);
    if (payslipError) console.error("Error fetching payslip activities:", payslipError);

    const combinedActivities: any[] = [];

    staffActivities?.forEach(staff => {
      combinedActivities.push({
        id: staff.id,
        type: "staff",
        description: `Staff member ${staff.first_name} ${staff.last_name} was created.`,
        timestamp: staff.created_at,
      });
      if (staff.created_at !== staff.updated_at) {
        combinedActivities.push({
          id: staff.id,
          type: "staff",
          description: `Staff member ${staff.first_name} ${staff.last_name} was updated.`,
          timestamp: staff.updated_at,
        });
      }
    });

    positionActivities?.forEach(position => {
      combinedActivities.push({
        id: position.id,
        type: "position",
        description: `Position '${position.title}' was created.`,
        timestamp: position.created_at,
      });
      if (position.created_at !== position.updated_at) {
        combinedActivities.push({
          id: position.id,
          type: "position",
          description: `Position '${position.title}' was updated.`,
          timestamp: position.updated_at,
        });
      }
    });

    allowanceActivities?.forEach(allowance => {
      combinedActivities.push({
        id: allowance.id,
        type: "allowance",
        description: `Allowance '${allowance.name}' was created.`,
        timestamp: allowance.created_at,
      });
      if (allowance.created_at !== allowance.updated_at) {
        combinedActivities.push({
          id: allowance.id,
          type: "allowance",
          description: `Allowance '${allowance.name}' was updated.`,
          timestamp: allowance.updated_at,
        });
      }
    });

    deductionActivities?.forEach(deduction => {
      combinedActivities.push({
        id: deduction.id,
        type: "deduction",
        description: `Deduction '${deduction.name}' was created.`,
        timestamp: deduction.created_at,
      });
      if (deduction.created_at !== deduction.updated_at) {
        combinedActivities.push({
          id: deduction.id,
          type: "deduction",
          description: `Deduction '${deduction.name}' was updated.`,
          timestamp: deduction.updated_at,
        });
      }
    });

    payrollRunActivities?.forEach(run => {
      combinedActivities.push({
        id: run.id,
        type: "payroll_run",
        description: `Payroll run for ${format(new Date(run.year, run.month - 1), 'MMMM yyyy')} was initiated.`,
        timestamp: run.created_at,
      });
      if (run.created_at !== run.processed_at) {
        combinedActivities.push({
          id: run.id,
          type: "payroll_run",
          description: `Payroll run for ${format(new Date(run.year, run.month - 1), 'MMMM yyyy')} was processed.`,
          timestamp: run.processed_at,
        });
      }
    });

    payslipActivities?.forEach(payslip => {
      combinedActivities.push({
        id: payslip.id,
        type: "payslip",
        description: `Payslip generated for ${payslip.staff?.first_name} ${payslip.staff?.last_name}.`,
        timestamp: payslip.created_at,
      });
    });

    // Sort by most recent timestamp
    combinedActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json(combinedActivities.slice(0, 10)); // Limit to top 10 activities

  } catch (error) {
    console.error("Error fetching recent activities:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

