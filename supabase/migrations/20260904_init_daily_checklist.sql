-- ==============================================================================
-- Quantum Gazipur cell, Raji sir Team Daily Checklist - Supabase Database Schema Migration
-- ==============================================================================
-- Description:
-- Stores daily operational logs for Quantum Gazipur cell (Raji sir Team), tracking
-- task status (done/pending), accountability reasons for pending tasks, and task templates.
--
-- Instructions:
-- 1. Open your Supabase Project Dashboard (https://supabase.com/dashboard)
-- 2. Navigate to SQL Editor -> "New Query"
-- 3. Paste and run this SQL script.
-- ==============================================================================

-- 1. Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Task Templates Table (manages the 20 core operational tasks + dynamic additions)
CREATE TABLE IF NOT EXISTS public.task_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    category TEXT DEFAULT 'Daily Operations',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Daily Logs Table (stores status & reason for incomplete tasks per day)
CREATE TABLE IF NOT EXISTS public.daily_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    task_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('done', 'pending')) DEFAULT 'pending',
    reason_for_pending TEXT DEFAULT '',
    order_index INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_daily_task UNIQUE (date, task_name)
);

-- 4. Create Indexes for High Performance Querying by Date
CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON public.daily_logs(date);
CREATE INDEX IF NOT EXISTS idx_daily_logs_status ON public.daily_logs(status);
CREATE INDEX IF NOT EXISTS idx_task_templates_order ON public.task_templates(order_index);

-- 5. Set up Row Level Security (RLS)
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;

-- Allow anonymous or authenticated access for reading and writing checklist data
-- (Adjust to auth.uid() = user_id if multi-user Supabase Auth is enabled)
CREATE POLICY "Allow public read access to task_templates"
    ON public.task_templates FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert/update/delete to task_templates"
    ON public.task_templates FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow public read access to daily_logs"
    ON public.daily_logs FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert/update to daily_logs"
    ON public.daily_logs FOR ALL
    USING (true)
    WITH CHECK (true);

-- 6. Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_templates ON public.task_templates;
CREATE TRIGGER set_updated_at_templates
    BEFORE UPDATE ON public.task_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_daily_logs ON public.daily_logs;
CREATE TRIGGER set_updated_at_daily_logs
    BEFORE UPDATE ON public.daily_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 7. Pre-seed Mina's 20 Core Tasks in Exact Requested Order
INSERT INTO public.task_templates (name, order_index, category)
VALUES
    ('Desk Set-up', 1, 'Morning Setup'),
    ('Meditation', 2, 'Wellness & Focus'),
    ('Equipments', 3, 'Hardware & Tools'),
    ('Sales Item', 4, 'Commercial'),
    ('Entertainment', 5, 'Atmosphere'),
    ('Office Check', 6, 'Facility Check'),
    ('Plant Check', 7, 'Environment'),
    ('Communication List', 8, 'Coordination'),
    ('Bkash MR', 9, 'Financial Reconciliation'),
    ('Mobile Balance', 10, 'Communication'),
    ('E-mail', 11, 'Inbox Management'),
    ('QMIS', 12, 'Quality & Management System'),
    ('Donation', 13, 'Corporate Social'),
    ('Cash Closing', 14, 'Financial Reconciliation'),
    ('Equipment Closing', 15, 'Hardware & Security'),
    ('Mobile Placing', 16, 'Asset Safety'),
    ('Information Update', 17, 'Records & Data'),
    ('Log Update', 18, 'Daily Logs'),
    ('Report', 19, 'Reporting'),
    ('Planing', 20, 'Next Day Strategy')
ON CONFLICT (name) DO UPDATE 
SET order_index = EXCLUDED.order_index,
    category = EXCLUDED.category;
