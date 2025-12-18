# Remunera Admin Setup Guide

This guide explains how to create the initial admin user for Remunera.

## Approach: Supabase Dashboard + SQL Script

Since Remunera uses Supabase Auth and doesn't have a public registration page, the initial admin is created through a secure two-step process:

### Step 1: Create Admin User in Supabase Auth

1. Go to your Supabase Dashboard
2. Navigate to **Authentication → Users**
3. Click **Add User → Create new user**
4. Fill in the admin credentials:
   - **Email**: `admin@remunera.com` (or your preferred admin email)
   - **Password**: Create a strong password
   - **Auto Confirm User**: ✅ Check this box (important!)
5. Click **Create User**
6. **Copy the User UUID** that appears after creation

### Step 2: Assign Admin Role

After creating the user, you need to assign the admin role:

#### Option A: Using Supabase SQL Editor

1. In Supabase Dashboard, go to **SQL Editor**
2. Run this query (replace `YOUR_USER_UUID` with the UUID from Step 1):

```sql
INSERT INTO profiles (id, email, full_name, role, phone_number)
VALUES (
  'YOUR_USER_UUID', -- Replace with actual UUID from Step 1
  'admin@remunera.com', -- Use the same email from Step 1
  'System Administrator',
  'admin',
  NULL
)
ON CONFLICT (id) 
DO UPDATE SET role = 'admin';
```

#### Option B: Using v0 SQL Scripts

1. Edit the file `scripts/005_create_admin_user.sql`
2. Replace `'00000000-0000-0000-0000-000000000000'` with your actual UUID
3. Replace the email if you used a different one
4. Run the script in v0

### Step 3: Log In

1. Go to your Remunera login page
2. Sign in with the admin credentials you created
3. You'll be redirected to the admin dashboard

### Step 4: Create Additional Users (Optional)

Once logged in as admin:

1. Navigate to **Admin → User Management**
2. Click **Add User**
3. Fill in the user details and select their role:
   - **Admin**: Full system access
   - **HR**: Staff management
   - **Payroll**: Payroll processing
   - **Staff**: View own information
4. The system will create the user in Supabase Auth automatically
5. Provide the credentials to the new user

## Security Best Practices

1. **Change the default admin password immediately** after first login
2. **Use a strong, unique password** for the admin account
3. **Don't share admin credentials** - create separate admin accounts for each administrator
4. **Enable 2FA** in Supabase project settings for additional security
5. **Regularly audit user access** through the User Management page

## Troubleshooting

### "User not found" error after login
- Check that the profile was created with the correct UUID
- Verify the UUID matches the auth.users.id in Supabase

### "Insufficient permissions" error
- Ensure the profile role is set to 'admin'
- Check Row Level Security policies in Supabase

### Can't access admin dashboard
- Clear browser cache and cookies
- Verify the user's role in the profiles table
- Check that middleware is correctly redirecting based on role

## Alternative: Automated Admin Creation

For a more automated approach, you can create a one-time setup API endpoint:

```typescript
// app/api/setup/admin/route.ts
// This endpoint should be protected or disabled after initial setup
export async function POST(request: Request) {
  const { email, password, setupKey } = await request.json()
  
  // Verify setup key matches environment variable
  if (setupKey !== process.env.ADMIN_SETUP_KEY) {
    return Response.json({ error: 'Invalid setup key' }, { status: 401 })
  }
  
  // Create admin user logic here...
}
```

This endpoint would only work once and require a secret key from environment variables.
