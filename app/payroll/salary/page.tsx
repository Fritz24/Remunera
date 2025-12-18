import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { SalaryStructureTable } from "@/components/payroll/salary-structure-table"

export default function SalaryStructurePage() {
  return (
    <DashboardLayout role="payroll" userName="Payroll Officer">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Salary Structure</h2>
          <p className="text-muted-foreground">Configure base salary structures for staff types</p>
        </div>
        <SalaryStructureTable />
      </div>
    </DashboardLayout>
  )
}
