-- ============================================================================
-- PostgreSQL Database Setup Script for Clinical System
-- Version: 1.0
-- Date: January 31, 2026
-- ============================================================================
-- 
-- This script creates:
--   1. clinical_app user with password: clinical_app_password
--   2. clinical_system database
--   3. Grants proper permissions
--
-- Run this script as the postgres superuser
-- ============================================================================

-- Create the clinical_app user
CREATE USER clinical_app WITH PASSWORD 'clinical_app_password';

-- Create the clinical_system database
CREATE DATABASE clinical_system WITH 
  OWNER clinical_app 
  ENCODING 'UTF8' 
  LC_COLLATE 'C' 
  LC_CTYPE 'C' 
  TEMPLATE template0;

-- Connect to the database and grant permissions
-- (You'll need to run this separately after connecting to clinical_system)
-- For now, grant default privileges:

-- Grant all privileges on the database
GRANT ALL PRIVILEGES ON DATABASE clinical_system TO clinical_app;

-- Display success message
\echo '================================'
\echo 'Database setup complete!'
\echo '================================'
\echo 'Database: clinical_system'
\echo 'User: clinical_app'
\echo 'Password: clinical_app_password'
\echo '================================'

-- List created databases
\l clinical_system
