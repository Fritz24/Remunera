-- Create initial admin user using environment variables
-- This script should be run after setting up ADMIN_EMAIL and ADMIN_PASSWORD environment variables

-- First, create the admin user in Supabase Auth (this would be done via Supabase dashboard or API)
-- Then insert the profile with admin role

-- Insert admin profile
-- Note: The UUID here should match the auth.users.id created in Supabase Auth
-- In practice, you'll need to get this UUID after creating the user in Supabase Auth

-- This is a template. The actual UUID will be inserted programmatically
-- See the setup instructions in ADMIN_SETUP.md

INSERT INTO profiles (id, email, full_name, role, phone_number)
VALUES (
  '00000000-0000-0000-0000-000000000000', -- This will be replaced with actual UUID
  'admin@remunera.com', -- Default admin email
  'System Administrator',
  'admin',
  NULL
)
ON CONFLICT (id) DO UPDATE
SET role = 'admin';
