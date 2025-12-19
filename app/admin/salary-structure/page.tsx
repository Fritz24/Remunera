import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { HrSalaryStructureContent } from "@/components/hr/hr-salary-structure-content"

export default function AdminSalaryStructurePage() {
  return (
    <DashboardLayout role="admin" userName="Admin">
      <HrSalaryStructureContent />
    </DashboardLayout>
  )
}

