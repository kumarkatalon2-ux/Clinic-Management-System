-- Clinical Management System Database Schema
-- PostgreSQL 15+
-- Run this script after creating the database

-- ==========================================
-- 1. USERS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    phone VARCHAR(20),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ==========================================
-- 2. PATIENTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    mrn VARCHAR(50) UNIQUE NOT NULL, -- Medical Record Number
    date_of_birth DATE,
    gender VARCHAR(20),
    blood_type VARCHAR(10),
    allergies TEXT,
    medical_conditions TEXT,
    insurance_provider VARCHAR(255),
    insurance_policy_number VARCHAR(100),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_patients_mrn ON patients(mrn);

-- ==========================================
-- 3. APPOINTMENTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    provider_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    appointment_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled',
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    location VARCHAR(255),
    notes TEXT,
    reason_for_visit TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_provider_id ON appointments(provider_id);
CREATE INDEX idx_appointments_start_time ON appointments(start_time);
CREATE INDEX idx_appointments_status ON appointments(status);

-- ==========================================
-- 4. CONSULTATIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS consultations (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    provider_id INTEGER REFERENCES users(id) NOT NULL,
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
    consultation_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'scheduled',
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    chief_complaint TEXT,
    history_of_present_illness TEXT,
    physical_examination TEXT,
    assessment TEXT,
    plan TEXT,
    medications TEXT,
    follow_up_instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX idx_consultations_provider_id ON consultations(provider_id);
CREATE INDEX idx_consultations_status ON consultations(status);

-- ==========================================
-- 5. PRESCRIPTIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS prescriptions (
    id SERIAL PRIMARY KEY,
    consultation_id INTEGER REFERENCES consultations(id) ON DELETE CASCADE,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100),
    duration VARCHAR(100),
    quantity INTEGER,
    refills_allowed INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    prescribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);

-- ==========================================
-- 6. LAB_TESTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS lab_tests (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    provider_id INTEGER REFERENCES users(id),
    test_name VARCHAR(255) NOT NULL,
    test_category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'ordered',
    ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    collected_at TIMESTAMP,
    result_received_at TIMESTAMP,
    result_value TEXT,
    result_unit VARCHAR(50),
    reference_range VARCHAR(100),
    abnormal BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lab_tests_patient_id ON lab_tests(patient_id);
CREATE INDEX idx_lab_tests_status ON lab_tests(status);

-- ==========================================
-- 7. INVOICES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    net_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date DATE,
    paid_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invoices_patient_id ON invoices(patient_id);
CREATE INDEX idx_invoices_appointment_id ON invoices(appointment_id);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_created_at ON invoices(created_at);

-- ==========================================
-- 8. PAYMENTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(100),
    status VARCHAR(50) DEFAULT 'completed',
    paid_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_paid_date ON payments(paid_date);

-- ==========================================
-- 9. AUDIT_LOG TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id INTEGER,
    changes TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- ==========================================
-- 8. SAMPLE DATA - DEMO USERS
-- ==========================================
-- Password hashes generated from bcrypt with salt rounds=10
-- admin123 hash
-- doctor123 hash
-- nurse123 hash
-- patient123 hash
INSERT INTO users (email, password_hash, first_name, last_name, role, status, phone)
VALUES 
    ('admin@clinic.com', '$2b$10$/YZY95eGl7XYIXJkl7wZXuG4BFbg4v8Rf5Hssl0adLoPvNCeOYcYC', 'Admin', 'User', 'administrator', 'active', '555-0001'),
    ('doctor@clinic.com', '$2b$10$6uaueXO2xeazvufeFi77I.q5X/PH8yy82nwBYVmbEgbMU7pn3QISK', 'Dr. John', 'Smith', 'doctor', 'active', '555-0002'),
    ('nurse@clinic.com', '$2b$10$YRpMGJPz9OHUeZN6eEfEV.9E8dTALPwXgFMnjwwHbVgRQ/t0E99Pe', 'Nurse', 'Jane', 'nurse', 'active', '555-0003'),
    ('patient@clinic.com', '$2b$10$Zv5ZCIZ/XfyYoRwhDxOWXO7r0gZOichI44wCV3/RKQPWU05r/N02e', 'John', 'Doe', 'patient', 'active', '555-0004')
ON CONFLICT DO NOTHING;

-- ==========================================
-- 9. SAMPLE DATA - DEMO PATIENTS
-- ==========================================
INSERT INTO patients (user_id, mrn, date_of_birth, gender, blood_type, allergies, status)
VALUES 
    (4, 'MRN-001', '1985-03-15', 'Male', 'O+', 'None', 'active'),
    (1, 'MRN-002', '1990-07-20', 'Female', 'A-', 'Penicillin', 'active')
ON CONFLICT DO NOTHING;

-- ==========================================
-- Schema complete! 
-- ==========================================
-- Database tables created with demo users and sample patients
-- Ready for appointment scheduling and consultation management
