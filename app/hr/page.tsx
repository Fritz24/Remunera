"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Briefcase, UserPlus } from "lucide-react" // Removed Building2
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client" // Use client-side Supabase
import { formatRelativeTime } from "@/lib/utils/formatters"

const fetcher = async (url: string) => {
  const supabase = createClient()
  const { data, error } = await supabase.from(url.split('/')[url.split('/').length - 1]).select('*') // Basic fetcher for now
  if (error) throw error
  return data
}

export default function HRDashboard() {
  const { data: totalStaff, error: totalStaffError } = useSWR('staff_count', async () => {
    const supabase = createClient()
    const { count, error } = await supabase.from('staff').select('*', { count: 'exact', head: true })
    if (error) throw error
    return count
  })

  const { data: activeStaff, error: activeStaffError } = useSWR('active_staff_count', async () => {
    const supabase = createClient()
    const { count, error } = await supabase.from('staff').select('*', { count: 'exact', head: true }).eq('employment_status', 'active')
    if (error) throw error
    return count
  })

  const { data: positionsCount, error: positionsCountError } = useSWR('positions_count', async () => {
    const supabase = createClient()
    const { count, error } = await supabase.from('position').select('*', { count: 'exact', head: true })
    if (error) throw error
    return count
  })

  const { data: staffPerPosition, error: staffPerPositionError } = useSWR('staff_per_position', async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('staff')
      .select('position(title)')

    if (error) throw error

    const counts = data.reduce((acc: { [key: string]: number }, staff: any) => {
      const positionTitle = staff.position?.title || 'Unassigned'
      acc[positionTitle] = (acc[positionTitle] || 0) + 1
      return acc
    }, {})

    return Object.entries(counts).map(([title, count]) => ({ title, count }))
  })


  const { data: recentChanges, error: recentChangesError } = useSWR('recent_changes', async () => {
    const supabase = createClient();

    // Fetch recent staff additions/updates
    const { data: staffChanges, error: staffError } = await supabase
      .from('staff')
      .select('id, first_name, last_name, created_at, updated_at, position(title)')
      .order('created_at', { ascending: false })
      .limit(5);

    // Fetch recent position creations
    const { data: positionCreations, error: positionError } = await supabase
      .from('position')
      .select('id, title, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (staffError) console.error("Error fetching staff changes:", staffError);
    if (positionError) console.error("Error fetching position creations:", positionError);

    const activities: { type: string; description: string; timestamp: string; icon: React.ReactNode }[] = [];

    staffChanges?.forEach(staff => {
      activities.push({
        type: "New staff member added",
        description: `${staff.first_name} ${staff.last_name} - ${staff.position?.title || 'N/A'}`,
        timestamp: staff.created_at,
        icon: <UserPlus className="h-4 w-4 text-green-600" />,
      });
      // You might also add 'Staff profile updated' if updated_at is significantly different from created_at
      if (new Date(staff.updated_at).getTime() - new Date(staff.created_at).getTime() > 1000 * 60) { // If updated more than a minute after creation
        activities.push({
          type: "Staff profile updated",
          description: `${staff.first_name} ${staff.last_name} profile updated`,
          timestamp: staff.updated_at,
          icon: <Users className="h-4 w-4 text-blue-600" />,
        });
      }
    });

    positionCreations?.forEach(position => {
      activities.push({
        type: "Position created",
        description: `${position.title} position created`,
        timestamp: position.created_at,
        icon: <Briefcase className="h-4 w-4 text-orange-600" />,
      });
    });

    // Sort all activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return activities;
  });


  if (totalStaffError || activeStaffError || positionsCountError || staffPerPositionError || recentChangesError) {
    console.error("Dashboard data fetch error:", totalStaffError || activeStaffError || positionsCountError || staffPerPositionError || recentChangesError)
    return <DashboardLayout role="hr" userName="HR Manager"><div>Error loading dashboard data.</div></DashboardLayout>
  }

  return (
    <DashboardLayout role="hr" userName="HR Manager">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">HR Dashboard</h2>
          <p className="text-muted-foreground">Manage staff, positions, and recent activities</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"> {/* Changed to lg:grid-cols-3 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStaff !== undefined ? totalStaff : 'Loading...'}</div>
              <p className="text-xs text-muted-foreground">Overall staff count</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeStaff !== undefined ? activeStaff : 'Loading...'}</div>
              <p className="text-xs text-muted-foreground">Currently active employees</p>
            </CardContent>
          </Card>
          {/* Removed Departments Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Positions</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{positionsCount !== undefined ? positionsCount : 'Loading...'}</div>
              <p className="text-xs text-muted-foreground">Available positions</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Changes</CardTitle> {/* Changed title */}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentChanges?.length > 0 ? (
                  recentChanges.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        {activity.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.type}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatRelativeTime(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground">No recent activity.</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Staff per Positions</CardTitle> {/* Changed title */}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {staffPerPosition?.length > 0 ? (
                  staffPerPosition.map((pos, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{pos.title}</span>
                      <span className="text-sm font-medium">{pos.count}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground">No staff per position data available.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
