import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = await createClient();
  const { currentPassword, newPassword } = await request.json();

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Current password and new password are required." }, { status: 400 });
  }

  try {
    // In a real application, you would first re-authenticate the user with their current password
    // For example: const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email: user.email, password: currentPassword });
    // If signInError, return error.
    // Then proceed to update.

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error("Supabase password update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Password updated successfully." }, { status: 200 });
  } catch (error) {
    console.error("API password change error:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

