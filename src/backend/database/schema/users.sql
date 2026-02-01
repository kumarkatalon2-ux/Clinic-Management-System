/**
 * Database Schema - Users Table
 * 
 * Run this file to create the users table in PostgreSQL:
 * psql -U postgres -d clinical_db -f src/backend/database/schema/users.sql
 */

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) DEFAULT 'patient' CHECK (role IN ('admin', 'doctor', 'nurse', 'receptionist', 'patient')),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'deleted')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Create audit log table
CREATE TABLE IF NOT EXISTS auth_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL CHECK (action IN ('login', 'logout', 'register', 'password_change', 'failed_login')),
  ip_address VARCHAR(50),
  user_agent TEXT,
  status VARCHAR(20) CHECK (status IN ('success', 'failed')),
  reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for audit log queries
CREATE INDEX IF NOT EXISTS idx_auth_logs_user_id ON auth_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_logs_created_at ON auth_logs(created_at);

-- Insert test users for development
INSERT INTO users (email, password_hash, first_name, last_name, role, status) 
VALUES 
  ('admin@clinic.local', '$2b$10$YixZaYV3mLELvjQNZwXjqe8KQmWKmxiDPZDGYe18JBZyJqKH2l7Oe', 'Admin', 'User', 'admin', 'active'),
  ('doctor@clinic.local', '$2b$10$YixZaYV3mLELvjQNZwXjqe8KQmWKmxiDPZDGYe18JBZyJqKH2l7Oe', 'John', 'Doe', 'doctor', 'active'),
  ('patient@clinic.local', '$2b$10$YixZaYV3mLELvjQNZwXjqe8KQmWKmxiDPZDGYe18JBZyJqKH2l7Oe', 'Jane', 'Smith', 'patient', 'active')
ON CONFLICT (email) DO NOTHING;

-- Note: All test users have password: "password123"
-- Hash generated with: bcrypt.hash('password123', 10)
