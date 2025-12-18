# Remunera

A comprehensive payroll management system for universities and organizations, built with Next.js, Supabase, and Tailwind CSS.

## Features

### Role-Based Access Control
- **Admin**: Full system access, user management, system configuration
- **HR**: Staff management, department oversight, position management
- **Payroll Officer**: Salary structures, allowances, deductions, payroll processing
- **Staff**: Personal profile, payslip viewing, attendance records

### Key Capabilities
- User and role management
- Staff information management with comprehensive forms
- Department and position tracking
- Salary structure configuration
- Allowances and deductions management
- CSV attendance upload with drag-and-drop
- Payroll run processing
- Payslip generation and distribution
- Comprehensive reporting
- Secure authentication with Supabase Auth

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **State Management**: SWR for data fetching
- **TypeScript**: Full type safety

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- Environment variables configured

### Installation

1. Clone or download the project
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (already provided in v0):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - And other Supabase connection variables

### Database Setup

1. Run the SQL scripts in order from the `scripts/` folder:
   - `001_create_schema.sql` - Creates all tables
   - `002_enable_rls.sql` - Sets up Row Level Security
   - `003_create_profile_trigger.sql` - Auto-creates profiles for new users
   - `004_seed_initial_data.sql` - Inserts default data

2. Create the initial admin user following the instructions in `ADMIN_SETUP.md`

### Running the Application

```bash
npm run dev
```

Navigate to `http://localhost:3000` and log in with your admin credentials.

## Initial Setup

See `ADMIN_SETUP.md` for detailed instructions on creating your first admin user.

## Project Structure

```
remunera/
├── app/
│   ├── admin/          # Admin dashboard pages
│   ├── hr/             # HR dashboard pages
│   ├── payroll/        # Payroll officer pages
│   ├── staff/          # Staff dashboard pages
│   ├── login/          # Authentication pages
│   └── api/            # API routes for CRUD operations
├── components/
│   ├── admin/          # Admin-specific components
│   ├── hr/             # HR-specific components
│   ├── payroll/        # Payroll-specific components
│   ├── staff/          # Staff-specific components
│   ├── auth/           # Authentication components
│   ├── layout/         # Shared layout components
│   └── ui/             # shadcn/ui components
├── lib/
│   ├── supabase/       # Supabase client utilities
│   ├── types.ts        # TypeScript type definitions
│   └── auth.ts         # Authentication helpers
└── scripts/            # Database SQL scripts
```

## Security

- Row Level Security (RLS) enabled on all tables
- Role-based access control enforced at database level
- Secure session management with HTTP-only cookies
- Protected API routes with authentication checks
- Password hashing handled by Supabase Auth

## Contributing

This project was Created by Fritz. For modifications:

1. Read the relevant files before making changes
2. Use TypeScript for type safety
3. Follow existing code patterns
4. Test role-based access control thoroughly
5. Maintain RLS policies for data security

## License

Private use only.
