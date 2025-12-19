"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { HrSalaryStructureContent } from "@/components/hr/hr-salary-structure-content"

export default function HRSalaryStructurePage() {
  return (
    <DashboardLayout role="hr" userName="HR Manager">
      <HrSalaryStructureContent />
    </DashboardLayout>
  )
}
