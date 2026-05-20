-- MAA Travels Database Schema
-- Run this in your Supabase SQL Editor

-- 1. Users Table (Admin Auth)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Vehicles Table (Owned Fleet)
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    number TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL, -- e.g., Hatchback, Sedan, SUV, Traveller, Bus
    seating_capacity INTEGER NOT NULL,
    fuel_type TEXT NOT NULL, -- e.g., Petrol, Diesel, CNG, EV
    transmission TEXT NOT NULL, -- e.g., Manual, Automatic
    ac_status BOOLEAN NOT NULL DEFAULT TRUE, -- TRUE = AC, FALSE = Non-AC
    rate_per_km NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    driver_allowance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    image_url TEXT,
    availability BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Clients Table (Hired fleet owners & details)
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_no TEXT UNIQUE NOT NULL, -- Hired vehicle number
    client_name TEXT NOT NULL,
    address TEXT NOT NULL,
    contact_number TEXT NOT NULL,
    email TEXT NOT NULL,
    pan_number TEXT NOT NULL,
    gst_number TEXT,
    bank_holder_name TEXT NOT NULL,
    bank_account_number TEXT NOT NULL,
    bank_ifsc TEXT NOT NULL,
    bank_name TEXT NOT NULL,
    vehicle_name TEXT NOT NULL,
    rc_number TEXT NOT NULL,
    insurance_details TEXT NOT NULL,
    document_urls JSONB DEFAULT '[]'::jsonb, -- list of uploaded files
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Contracts Table (Generated Contracts)
CREATE TABLE IF NOT EXISTS contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name TEXT NOT NULL,
    address TEXT NOT NULL,
    pan TEXT NOT NULL,
    gst TEXT,
    vehicle_details TEXT NOT NULL,
    rates TEXT NOT NULL,
    contract_duration TEXT NOT NULL,
    terms_conditions TEXT NOT NULL,
    payment_terms TEXT NOT NULL,
    document_url TEXT, -- Saved copy path
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Payments Table (Accounting Entries)
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_number TEXT UNIQUE NOT NULL,
    month TEXT NOT NULL,
    year INTEGER NOT NULL,
    vehicle_number TEXT NOT NULL,
    vehicle_name TEXT,
    pan TEXT,
    basic_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    commission_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    commission_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    net_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tds_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    tds_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    deductions NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    net_to_pay NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    paid_status TEXT NOT NULL DEFAULT 'Pending', -- 'Paid' or 'Pending'
    paid_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Inquiries Table (Customer contact submissions)
CREATE TABLE IF NOT EXISTS inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    company_name TEXT,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Unresolved', -- 'Unresolved' or 'Resolved'
    reply_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on payments for faster querying
CREATE INDEX IF NOT EXISTS idx_payments_month_year ON payments(month, year);
CREATE INDEX IF NOT EXISTS idx_payments_vehicle_number ON payments(vehicle_number);

-- Enable RLS and setup bypass policies or public access policy for testing,
-- but since we query from backend server with full admin/service role, 
-- backend bypasses RLS if using service role, or we can enable open access for simplicity:
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE contracts DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries DISABLE ROW LEVEL SECURITY;
