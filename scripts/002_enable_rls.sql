-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE department ENABLE ROW LEVEL SECURITY;
ALTER TABLE position ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_structure ENABLE ROW LEVEL SECURITY;
ALTER TABLE allowance ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_allowance ENABLE ROW LEVEL SECURITY;
ALTER TABLE deduction ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_deduction ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_run ENABLE ROW LEVEL SECURITY;
ALTER TABLE payslip ENABLE ROW LEVEL SECURITY;
ALTER TABLE payslip_details ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can insert profiles" ON profiles FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete profiles" ON profiles FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Staff Type policies (Admin only)
CREATE POLICY "Admin can manage staff types" ON staff_type FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "All users can view staff types" ON staff_type FOR SELECT USING (auth.uid() IS NOT NULL);

-- Department policies (Admin and HR)
CREATE POLICY "Admin and HR can manage departments" ON department FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'hr'))
);
CREATE POLICY "All users can view departments" ON department FOR SELECT USING (auth.uid() IS NOT NULL);

-- Position policies (Admin and HR)
CREATE POLICY "Admin and HR can manage positions" ON position FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'hr'))
);
CREATE POLICY "All users can view positions" ON position FOR SELECT USING (auth.uid() IS NOT NULL);

-- Staff policies
CREATE POLICY "Admin and HR can manage staff" ON staff FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'hr'))
);
CREATE POLICY "Staff can view their own data" ON staff FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'hr', 'payroll'))
);

-- Salary Structure policies
CREATE POLICY "Admin, HR, and Payroll can manage salary" ON salary_structure FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'hr', 'payroll'))
);
CREATE POLICY "Staff can view their own salary" ON salary_structure FOR SELECT USING (
    EXISTS (SELECT 1 FROM staff WHERE id = salary_structure.staff_id AND user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'hr', 'payroll'))
);

-- Allowance policies
CREATE POLICY "Admin and Payroll can manage allowances" ON allowance FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'payroll'))
);
CREATE POLICY "All users can view allowances" ON allowance FOR SELECT USING (auth.uid() IS NOT NULL);

-- Staff Allowance policies
CREATE POLICY "Admin and Payroll can manage staff allowances" ON staff_allowance FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'payroll'))
);
CREATE POLICY "Staff can view their own allowances" ON staff_allowance FOR SELECT USING (
    EXISTS (SELECT 1 FROM staff WHERE id = staff_allowance.staff_id AND user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'payroll'))
);

-- Deduction policies
CREATE POLICY "Admin and Payroll can manage deductions" ON deduction FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'payroll'))
);
CREATE POLICY "All users can view deductions" ON deduction FOR SELECT USING (auth.uid() IS NOT NULL);

-- Staff Deduction policies
CREATE POLICY "Admin and Payroll can manage staff deductions" ON staff_deduction FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'payroll'))
);
CREATE POLICY "Staff can view their own deductions" ON staff_deduction FOR SELECT USING (
    EXISTS (SELECT 1 FROM staff WHERE id = staff_deduction.staff_id AND user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'payroll'))
);

-- Attendance policies
CREATE POLICY "Admin and Payroll can manage attendance" ON attendance FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'payroll'))
);
CREATE POLICY "Staff can view their own attendance" ON attendance FOR SELECT USING (
    EXISTS (SELECT 1 FROM staff WHERE id = attendance.staff_id AND user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'hr', 'payroll'))
);

-- Payroll Run policies
CREATE POLICY "Admin and Payroll can manage payroll runs" ON payroll_run FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'payroll'))
);
CREATE POLICY "All users can view payroll runs" ON payroll_run FOR SELECT USING (auth.uid() IS NOT NULL);

-- Payslip policies
CREATE POLICY "Admin and Payroll can manage payslips" ON payslip FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'payroll'))
);
CREATE POLICY "Staff can view their own payslips" ON payslip FOR SELECT USING (
    EXISTS (SELECT 1 FROM staff WHERE id = payslip.staff_id AND user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'payroll'))
);

-- Payslip Details policies
CREATE POLICY "Admin and Payroll can manage payslip details" ON payslip_details FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'payroll'))
);
CREATE POLICY "Staff can view their own payslip details" ON payslip_details FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM payslip p 
        JOIN staff s ON s.id = p.staff_id 
        WHERE p.id = payslip_details.payslip_id AND s.user_id = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'payroll'))
);
