"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"
import { toast } from "sonner"

export function AdminSettingsContent() {
  const [orgName, setOrgName] = useState("University Name")
  const [orgEmail, setOrgEmail] = useState("admin@university.edu")
  const [autoGeneratePayslips, setAutoGeneratePayslips] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [twoFactorAuth, setTwoFactorAuth] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState(30)
  const [loading, setLoading] = useState(false)

  const handleSaveChanges = async (settingsType: string) => {
    setLoading(true);
    // Placeholder for API call to save settings
    console.log(`Saving ${settingsType} settings:`, {
      orgName, orgEmail, autoGeneratePayslips, emailNotifications, twoFactorAuth, sessionTimeout
    });
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success(`${settingsType} settings saved successfully!`);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
        <p className="text-muted-foreground">Configure system-wide settings and preferences</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Basic system configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization Name</Label>
              <Input id="org-name" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-email">Organization Email</Label>
              <Input id="org-email" type="email" value={orgEmail} onChange={(e) => setOrgEmail(e.target.value)} />
            </div>
            <Button onClick={() => handleSaveChanges("General")} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payroll Settings</CardTitle>
            <CardDescription>Configure payroll system preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-generate Payslips</Label>
                <p className="text-sm text-muted-foreground">Automatically generate payslips after payroll runs</p>
              </div>
              <Switch checked={autoGeneratePayslips} onCheckedChange={setAutoGeneratePayslips} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send email notifications to staff when payslips are ready
                </p>
              </div>
              <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>
            <Button onClick={() => handleSaveChanges("Payroll")} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>System security and access control</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Require 2FA for all admin users</p>
              </div>
              <Switch checked={twoFactorAuth} onCheckedChange={setTwoFactorAuth} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
              <Input id="session-timeout" type="number" value={sessionTimeout} onChange={(e) => setSessionTimeout(parseInt(e.target.value))} />
            </div>
            <Button onClick={() => handleSaveChanges("Security")} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

