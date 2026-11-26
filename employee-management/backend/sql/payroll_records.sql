-- Run once on your database. Stores the weekly payroll records the Owner saves
-- on the Employee payroll page.
CREATE TABLE IF NOT EXISTS payroll_records (
    id                      INT AUTO_INCREMENT PRIMARY KEY,
    employee_name           VARCHAR(150)  NOT NULL,
    position                VARCHAR(100)  NOT NULL,
    week_start              DATE          NOT NULL,
    week_end                DATE          NOT NULL,
    hours                   DECIMAL(8,1)  NOT NULL,
    rate                    DECIMAL(10,2) NOT NULL,
    late_deduction          DECIMAL(10,2) NOT NULL DEFAULT 0,
    absence_deduction       DECIMAL(10,2) NOT NULL DEFAULT 0,
    wrong_project_deduction DECIMAL(10,2) NOT NULL DEFAULT 0,
    gross                   DECIMAL(12,2) NOT NULL,
    deductions              DECIMAL(12,2) NOT NULL,
    net                     DECIMAL(12,2) NOT NULL,
    created_at              TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_payroll_employee_week (employee_name, week_start)
);
