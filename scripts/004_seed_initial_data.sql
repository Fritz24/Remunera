-- Insert default staff types
INSERT INTO staff_type (name, description) VALUES
    ('Full-Time', 'Full-time permanent staff'),
    ('Part-Time', 'Part-time staff'),
    ('Contract', 'Contract-based staff'),
    ('Intern', 'Internship positions')
ON CONFLICT (name) DO NOTHING;

-- Insert default departments
INSERT INTO department (name, code, description) VALUES
    ('Administration', 'ADM', 'Administrative department'),
    ('Academic Affairs', 'ACA', 'Academic affairs and curriculum'),
    ('Finance', 'FIN', 'Finance and accounting'),
    ('Human Resources', 'HR', 'Human resources management'),
    ('IT Services', 'IT', 'Information technology services'),
    ('Student Affairs', 'SA', 'Student services and affairs')
ON CONFLICT (name) DO NOTHING;

-- Insert default allowances
INSERT INTO allowance (name, description, amount_type, default_amount, is_taxable) VALUES
    ('Housing Allowance', 'Housing and accommodation allowance', 'fixed', 50000.00, true),
    ('Transport Allowance', 'Transportation allowance', 'fixed', 20000.00, true),
    ('Medical Allowance', 'Medical and health allowance', 'fixed', 15000.00, false),
    ('Academic Allowance', 'Academic and research allowance', 'percentage', 10.00, true),
    ('Meal Allowance', 'Meal and subsistence allowance', 'fixed', 10000.00, true)
ON CONFLICT DO NOTHING;

-- Insert default deductions
INSERT INTO deduction (name, description, amount_type, default_amount, is_mandatory) VALUES
    ('Income Tax', 'Federal income tax', 'percentage', 7.50, true),
    ('Pension', 'Pension contribution', 'percentage', 8.00, true),
    ('National Health Insurance', 'Health insurance contribution', 'percentage', 5.00, true),
    ('Union Dues', 'Union membership dues', 'fixed', 2000.00, false),
    ('Cooperative Savings', 'Staff cooperative savings', 'percentage', 5.00, false)
ON CONFLICT DO NOTHING;
