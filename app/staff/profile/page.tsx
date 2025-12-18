import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StaffProfile } from "@/components/staff/staff-profile"

export default function StaffProfilePage() {
  return (
    <DashboardLayout role="staff" userName="John Smith">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Profile</h2>
          <p className="text-muted-foreground">View your personal and employment information</p>
        </div>
        <StaffProfile />
      </div>
    </DashboardLayout>
  )
}
