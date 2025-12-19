import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data || !data.user) {
    redirect("/login")
  }

  const { user } = data

  // Get user profile with role
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return { user, profile }
}

export async function requireRole(allowedRoles: string[]) {
  const { profile } = await getCurrentUser()

  if (!profile || !allowedRoles.includes(profile.role)) {
    redirect("/login")
  }

  return profile
}
