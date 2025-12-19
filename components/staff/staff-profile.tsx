"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, Calendar, Briefcase, DollarSign, KeyRound, ArrowRightCircle } from 'lucide-react' // Removed Building2, added KeyRound, ArrowRightCircle
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { formatCfa } from "@/lib/utils/formatters"
import { toast } from "sonner"

interface StaffProfileData {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  employment_status: string
  position: { title: string }
  hire_date: string
  salary_structure: { basic_salary: number }[]
  staff_allowance: { allowance: { name: string; amount: number } }[]
  staff_deduction: { deduction: { name: string; amount: number } }[]
}

export function StaffProfile() {
  const supabase = createClient()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [loadingPasswordChange, setLoadingPasswordChange] = useState(false);

  const { data: user, error: userError } = useSWR("sessionUser", async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  });

  const { data: staffProfile, error: staffProfileError, isLoading: staffProfileLoading } = useSWR<StaffProfileData>(
    user?.id ? `staff_profile_${user.id}` : null,
    async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("staff")
        .select(
          `
          id,
          first_name,
          last_name,
          email,
          phone,
          employment_status,
          position(title),
          hire_date,
          salary_structure(basic_salary),
          staff_allowance(allowance(name, amount)),
          staff_deduction(deduction(name, amount))
        `,
        )
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching staff profile:", error);
        throw error;
      }
      return data;
    }
  );

  const handleSubmitPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }

    setLoadingPasswordChange(true);
    try {
      // Supabase does not support changing password with current password directly in client
      // For security, typical flow involves: 
      // 1. User signs in with current credentials to re-authenticate
      // 2. Then updates password if re-authentication is successful
      // For this implementation, we'll simulate an update by calling the API route
      // A robust solution would involve server-side re-authentication and then update
      const response = await fetch("/api/employee/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to change password.");
      }

      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      console.error("Password change error:", error);
      toast.error(`Error changing password: ${(error as Error).message}`);
    } finally {
      setLoadingPasswordChange(false);
    }
  };

  if (userError || staffProfileError) {
    return <div className="text-center text-destructive">Failed to load profile data.</div>;
  }

  if (staffProfileLoading || !staffProfile) {
    return <div className="text-center text-muted-foreground">Loading profile...</div>;
  }

  const totalAllowances = staffProfile.staff_allowance?.reduce((sum, sa) => sum + (sa.allowance?.amount || 0), 0) || 0;
  const totalDeductions = staffProfile.staff_deduction?.reduce((sum, sd) => sum + (sd.deduction?.amount || 0), 0) || 0;
  const netSalary = (staffProfile.salary_structure?.[0]?.basic_salary || 0) + totalAllowances - totalDeductions;

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
                {staffProfile.first_name} {staffProfile.last_name}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Employment Status</p>
              <Badge variant={staffProfile.employment_status === "active" ? "default" : "secondary"}>{staffProfile.employment_status}</Badge>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{staffProfile.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">{staffProfile.phone || "N/A"}</p>
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
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Position</p>
                <p className="font-medium">{staffProfile.position?.title || "N/A"}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Employment Status</p>
              <Badge
                variant="secondary"
                className={
                  staffProfile.employment_status === "active"
                    ? "bg-green-100 text-green-800"
                    : staffProfile.employment_status === "inactive"
                      ? "bg-gray-100 text-gray-800"
                      : staffProfile.employment_status === "terminated"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                }
              >
                {staffProfile.employment_status}
              </Badge>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Hire Date</p>
                <p className="font-medium">{staffProfile.hire_date ? format(new Date(staffProfile.hire_date), "PPP") : "N/A"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Basic Salary</p>
                <p className="font-medium font-mono">{formatCfa(staffProfile.salary_structure?.[0]?.basic_salary || 0)}</p>
              </div>
            </div>
          </div>

          {staffProfile.staff_allowance && staffProfile.staff_allowance.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Allowances</p>
              <div className="flex flex-wrap gap-2">
                {staffProfile.staff_allowance.map((sa, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                    {sa.allowance?.name} ({formatCfa(sa.allowance?.amount || 0)})
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {staffProfile.staff_deduction && staffProfile.staff_deduction.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Deductions</p>
              <div className="flex flex-wrap gap-2">
                {staffProfile.staff_deduction.map((sd, index) => (
                  <Badge key={index} variant="secondary" className="bg-red-100 text-red-800">
                    {sd.deduction?.name} (-{formatCfa(sd.deduction?.amount || 0)})
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Net Salary</p>
              <p className="font-medium font-mono">{formatCfa(netSalary)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5" /> Change Password</CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitPasswordChange} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={loadingPasswordChange}>
              {loadingPasswordChange ? 'Changing...' : <><ArrowRightCircle className="mr-2 h-4 w-4" /> Change Password</>}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
