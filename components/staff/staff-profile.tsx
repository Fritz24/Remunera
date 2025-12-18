import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, Calendar, Building2, Briefcase, DollarSign } from 'lucide-react'

export function StaffProfile() {
  // Mock data - replace with actual user data from Supabase
  const staffData = {
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@university.edu",
    phone: "+1 (555) 123-4567",
    department: "Computer Science",
    position: "Senior Lecturer",
    employmentType: "full-time",
    staffType: "Academic Staff",
    hireDate: "2021-01-15",
    salary: 6500,
    status: "active",
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Your basic personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="font-medium">
                {staffData.firstName} {staffData.lastName}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Employment Status</p>
              <Badge variant={staffData.status === "active" ? "default" : "secondary"}>{staffData.status}</Badge>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{staffData.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">{staffData.phone}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Employment Information</CardTitle>
          <CardDescription>Your job and department details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="font-medium">{staffData.department}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Position</p>
                <p className="font-medium">{staffData.position}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Employment Type</p>
              <Badge
                variant="secondary"
                className={
                  staffData.employmentType === "full-time"
                    ? "bg-green-100 text-green-800"
                    : "bg-blue-100 text-blue-800"
                }
              >
                {staffData.employmentType}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Staff Type</p>
              <p className="font-medium">{staffData.staffType}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Hire Date</p>
                <p className="font-medium">{new Date(staffData.hireDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Basic Salary</p>
                <p className="font-medium font-mono">${staffData.salary.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
