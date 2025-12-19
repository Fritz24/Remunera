# PlantUML Guide for Remunera System (ChatGPT Edition)

This guide provides the logic and structure for the **Remunera University Payroll System**. You can paste this entire document into ChatGPT to generate specific PlantUML code for your documentation.

---

## 1. System Context for ChatGPT
The Remunera system is a University Payroll Management System built with:
- **Frontend**: Next.js (React)
- **Backend**: Supabase (PostgreSQL & Auth)
- **Key Entities**: Staff, Positions, Payroll Runs, Payslips, Attendance, Allowances, Deductions.

---

## 2. Diagram Logic & Descriptions

### A. Collaboration Diagram: Payslip Generation
**Goal**: Show how objects interact to create a single payslip.
- **Actors/Objects**: `PayrollRunController`, `StaffRecord`, `AttendanceRecord`, `SalaryCalculator`, `PayslipRecord`.
- **Logic**:
  1. `PayrollRunController` requests `StaffRecord` details.
  2. `PayrollRunController` fetches `AttendanceRecord` for the month.
  3. `SalaryCalculator` receives data and computes Gross, Deductions, and Net.
  4. `PayslipRecord` is created and linked to the `Staff` and `PayrollRun`.

### B. Sequence Diagram: Payroll Run Execution
**Goal**: Show the chronological flow of executing a full payroll run for all staff.
- **Actors/Objects**: `Admin`, `PayrollDashboard`, `PayrollAPI`, `Database`.
- **Logic**:
  1. `Admin` clicks "Run Payroll" on `PayrollDashboard`.
  2. `PayrollDashboard` sends request to `PayrollAPI` with Month/Year.
  3. `PayrollAPI` fetches all "Active" staff from `Database`.
  4. For each staff: `API` calculates pay, inserts `Payslip`, and updates `Attendance`.
  5. `PayrollAPI` updates the `PayrollRun` status to "Approved".
  6. `Database` confirms save.
  7. `PayrollDashboard` shows "Success" message to `Admin`.

### C. Activity Diagram: Payroll Processing Workflow
**Goal**: Show the step-by-step logic and decision points during payroll processing.
- **Steps**:
  - Start -> Select Month/Year.
  - Check if Payroll Run already exists for this period?
    - If Yes: Prompt to Overwrite or View.
    - If No: Initialize New Run.
  - Upload Attendance CSV?
    - If Yes: Parse CSV -> Match Staff -> Calculate Hourly Pay.
    - If No: Fetch Fixed Salaries for Full-Time staff.
  - Apply Allowances & Deductions.
  - Calculate Net Pay.
  - Generate Payslips.
  - Finalize Run -> Set Status to "Approved".
  - End.

### D. Activity Diagram: User Authentication Process
**Goal**: Show the login and role-based redirection flow.
- **Steps**:
  - Start -> User enters Email/Password.
  - Validate with Supabase Auth.
  - Credentials Correct?
    - No: Show Error -> Back to Login.
    - Yes: Fetch User Role from `profiles` table.
  - Role Check:
    - If "Admin": Redirect to `/admin/dashboard`.
    - If "HR": Redirect to `/hr/dashboard`.
    - If "Staff": Redirect to `/staff/dashboard`.
  - End.

### E. Use Case Diagram: Actor Interactions
**Goal**: Show how different roles interact with the system features.
- **Actors**: Admin, HR Manager, Payroll Officer, Staff Member.
- **Use Cases**:
  - **Admin**: Manage Users, System Settings, Audit Logs.
  - **HR**: Manage Staff Profiles, Manage Positions, Update Employment Status.
  - **Payroll**: Upload Attendance, Execute Payroll Run, Manage Allowances/Deductions, View Reports.
  - **Staff**: View Own Payslips, Download Payslip PDF, Update Personal Profile.
  - **All**: Login, Change Password, Logout.

---

## 3. Instructions for ChatGPT
*Paste the following prompt along with the sections above:*

> "Using the 'Remunera System' context provided above, please generate the PlantUML code for the following diagrams:
> 1. A **Collaboration Diagram** for Payslip Generation.
> 2. A **Sequence Diagram** for Payroll Run Execution.
> 3. An **Activity Diagram** for the Payroll Processing Workflow.
> 4. An **Activity Diagram** for the User Authentication Process.
> 5. A **Use Case Diagram** showing how all actors interact with the system.
> Please use professional styling and clear labels."
