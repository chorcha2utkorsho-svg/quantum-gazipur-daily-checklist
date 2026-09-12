import React, { useState, useEffect } from 'react';
import { getStoredSupabaseConfig, testConnection } from '../lib/supabase';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
}

const SQL_SCHEMA_CONTENT = `-- Quantum Gazipur cell, Raji sir Team - Supabase Database Schema
-- Run in Supabase SQL Editor (https://supabase.com/dashboard)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Employees Table (Role-based Team Members)
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    pin TEXT NOT NULL DEFAULT '1234',
    role TEXT NOT NULL DEFAULT 'general_staff',
    is_active BOOLEAN NOT NULL DEFAULT true,
    phone TEXT DEFAULT '',
    joined_date DATE DEFAULT CURRENT_DATE,
    notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Daily Logs Table (stores daily task status and accountability reasons per employee)
CREATE TABLE IF NOT EXISTS public.daily_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    employee_id TEXT NOT NULL DEFAULT 'SUPERVISOR',
    task_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('done', 'pending')) DEFAULT 'pending',
    reason_for_pending TEXT DEFAULT '',
    order_index INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_daily_employee_task UNIQUE (date, employee_id, task_name)
);

-- 3. Task Templates Table (for dynamic add/edit/delete of tasks)
CREATE TABLE IF NOT EXISTS public.task_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    category TEXT DEFAULT 'Operations',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Fast query indexes
CREATE INDEX IF NOT EXISTS idx_daily_logs_date_emp ON public.daily_logs(date, employee_id);
CREATE INDEX IF NOT EXISTS idx_employees_role ON public.employees(role);

-- 5. Enable Row Level Security (RLS) & Policies
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all employees" ON public.employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all daily_logs" ON public.daily_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all task_templates" ON public.task_templates FOR ALL USING (true) WITH CHECK (true);

-- 6. Seed Default Employees (Supervisor & Cell Team)
INSERT INTO public.employees (employee_id, name, pin, role, is_active, notes)
VALUES
    ('SUPERVISOR', 'Office Assistant / Supervisor (Raji Sir Team)', '1234', 'office_assistant', true, 'Overall cell operations and supervisory incharge.'),
    ('EMP-01', 'Mina', '1234', 'front_desk', true, 'Front desk and daily 20 core operational checklist tasks.'),
    ('EMP-02', 'Tanvir Ahmed', '1234', 'accounts', true, 'Cash closing, bKash MR, and financial record manager.'),
    ('EMP-03', 'Sadia Tasnim', '1234', 'customer_service', true, 'Sales item and donor relations coordinator.'),
    ('EMP-04', 'Md. Rafiqul Islam', '1234', 'logistics', true, 'Facility check, plant care, and office security routine.')
ON CONFLICT (employee_id) DO NOTHING;

-- 7. Seed Quantum Gazipur cell, Raji sir Team 20 Core Tasks
INSERT INTO public.task_templates (name, order_index, category)
VALUES
    ('Desk Set-up', 1, 'Morning Routine'),
    ('Meditation', 2, 'Wellness & Focus'),
    ('Equipments', 3, 'Hardware & Tools'),
    ('Sales Item', 4, 'Commercial'),
    ('Entertainment', 5, 'Atmosphere'),
    ('Office Check', 6, 'Facility Check'),
    ('Plant Check', 7, 'Environment'),
    ('Guest Book', 8, 'Customer Service'),
    ('Program Schedule', 9, 'Operations'),
    ('Communication with Organizers', 10, 'Outreach'),
    ('Clean Table', 11, 'Workplace Hygiene'),
    ('Cash Closing', 12, 'Financial'),
    ('Check Lock', 13, 'Security'),
    ('Follow Up', 14, 'Customer Service'),
    ('Pre-Program', 15, 'Event Prep'),
    ('Courier', 16, 'Logistics'),
    ('bKash MR', 17, 'Financial'),
    ('Bill/Voucher Sent', 18, 'Financial'),
    ('All System Turn Off', 19, 'Shutdown Protocol'),
    ('Keys Kept in Designated Place', 20, 'Security')
ON CONFLICT (name) DO NOTHING;
`;

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved,
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'connect' | 'schema' | 'vercel'>('connect');

  useEffect(() => {
    if (isOpen) {
      const cfg = getStoredSupabaseConfig();
      setUrl(cfg.url || '');
      setAnonKey(cfg.anonKey || '');
      setStatusMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) {
      setStatusMsg({
        type: 'error',
        text: 'Please enter both Supabase URL and Anon Key.',
      });
      return;
    }

    setIsTesting(true);
    setStatusMsg({ type: 'info', text: 'Testing Supabase connection...' });

    const ok = await testConnection(url.trim(), anonKey.trim());
    setIsTesting(false);

    if (ok) {
      localStorage.setItem('quantum_supabase_url', url.trim());
      localStorage.setItem('quantum_supabase_key', anonKey.trim());
      setStatusMsg({
        type: 'success',
        text: 'Connected successfully to Supabase! Daily logs are now saved to the cloud.',
      });
      onConfigSaved();
    } else {
      setStatusMsg({
        type: 'error',
        text: 'Could not connect. Please check the URL and Anon Key, or verify that the SQL schema has been executed.',
      });
    }
  };

  const handleClear = () => {
    localStorage.removeItem('quantum_supabase_url');
    localStorage.removeItem('quantum_supabase_key');
    setUrl('');
    setAnonKey('');
    setStatusMsg({
      type: 'info',
      text: 'Supabase credentials cleared. Using local browser storage.',
    });
    onConfigSaved();
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_CONTENT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="supabase-modal"
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-[#0a0a0a] border border-white/10 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">Supabase Cloud Database Settings</h2>
            <p className="text-xs text-[#8e9299]">
              Connect Supabase for persistent multi-device task tracking and team synchronization
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-2.5 py-1 rounded text-xs font-bold text-[#8e9299] hover:text-white hover:bg-white/5 transition-colors"
          >
            [Close]
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-white/10 bg-black/20">
          <button
            type="button"
            onClick={() => setActiveTab('connect')}
            className={`px-3.5 py-2 text-xs uppercase tracking-wider font-semibold border-b-2 transition-colors ${
              activeTab === 'connect'
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-[#8e9299] hover:text-[#e5e5e5]'
            }`}
          >
            Connection Setup
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('schema')}
            className={`px-3.5 py-2 text-xs uppercase tracking-wider font-semibold border-b-2 transition-colors ${
              activeTab === 'schema'
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-[#8e9299] hover:text-[#e5e5e5]'
            }`}
          >
            SQL Migration Schema
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('vercel')}
            className={`px-3.5 py-2 text-xs uppercase tracking-wider font-semibold border-b-2 transition-colors ${
              activeTab === 'vercel'
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-[#8e9299] hover:text-[#e5e5e5]'
            }`}
          >
            Vercel / Next.js Guide
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: Connect */}
          {activeTab === 'connect' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-xs text-[#e5e5e5] space-y-1.5">
                <div className="font-semibold text-emerald-400">
                  Steps to connect Supabase Cloud Database:
                </div>
                <ol className="list-decimal list-inside text-xs text-[#8e9299] space-y-1 leading-relaxed">
                  <li>Log in to the <strong className="text-white">Supabase Dashboard</strong> (supabase.com) and open your project.</li>
                  <li>Go to <strong className="text-white">Project Settings &gt; API</strong> and copy your <strong>Project URL</strong> and <strong>anon (public) key</strong>.</li>
                  <li>Paste both values below and click <strong className="text-emerald-400">"Test &amp; Connect"</strong>.</li>
                  <li>Switch to the <strong className="text-emerald-400">"SQL Migration Schema"</strong> tab above, copy the SQL, and execute it in your Supabase SQL Editor.</li>
                </ol>
              </div>

              {statusMsg && (
                <div
                  className={`p-3.5 rounded text-xs ${
                    statusMsg.type === 'success'
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                      : statusMsg.type === 'error'
                      ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                      : 'bg-white/5 text-[#e5e5e5] border border-white/10'
                  }`}
                >
                  <span>{statusMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleTestAndSave} className="space-y-3.5">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#8e9299] mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://xyzproject.supabase.co"
                    className="w-full text-xs px-3.5 py-2.5 rounded bg-black/50 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[11px] text-[#8e9299] mt-1 block">
                    Found in Supabase Dashboard &gt; Project Settings &gt; API
                  </span>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#8e9299] mb-1">
                    Supabase Anon (Public) Key
                  </label>
                  <input
                    type="password"
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full text-xs px-3.5 py-2.5 rounded bg-black/50 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <span className="text-[11px] text-[#8e9299] mt-1 block">
                    Safe to use client-side with Row Level Security (RLS) policies.
                  </span>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-xs uppercase tracking-wider text-[#8e9299] hover:text-rose-400 transition-colors"
                  >
                    [Clear Credentials]
                  </button>

                  <button
                    type="submit"
                    disabled={isTesting}
                    className="px-4 py-2 rounded text-xs uppercase tracking-widest font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all disabled:opacity-50"
                  >
                    {isTesting ? 'Testing Connection...' : 'Test & Connect'}
                  </button>
                </div>
              </form>

              <div className="mt-4 p-4 rounded bg-white/[0.02] border border-white/5 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Offline-First &amp; Automatic Synchronization:
                </div>
                <p className="text-xs text-[#8e9299] leading-relaxed">
                  The application is engineered with an offline-first architecture. When Supabase is connected, all checklist toggles and reasons for incomplete tasks are instantly synchronized with your cloud database. If Supabase is offline or not yet configured, all records are stored reliably in your browser local storage.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Schema */}
          {activeTab === 'schema' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#e5e5e5]">
                    PostgreSQL Migration Script
                  </h3>
                  <p className="text-[11px] text-[#8e9299]">
                    Paste this into Supabase SQL Editor to initialize the tables and seed tasks
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-3 py-1.5 rounded text-xs uppercase tracking-wider font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
                >
                  {copiedSql ? '[Copied to Clipboard!]' : '[Copy SQL Schema]'}
                </button>
              </div>

              <div className="relative rounded overflow-hidden border border-white/10 bg-black/80">
                <pre className="p-4 text-xs font-mono text-emerald-400/90 overflow-x-auto max-h-80 leading-relaxed">
                  {SQL_SCHEMA_CONTENT}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: Vercel / Next.js Guide */}
          {activeTab === 'vercel' && (
            <div className="space-y-4 text-xs text-[#e5e5e5]">
              <div className="p-4 rounded bg-white/[0.02] border border-white/5 space-y-2">
                <h4 className="font-semibold text-white text-sm">Vercel Environment Setup</h4>
                <p className="text-[#8e9299]">
                  When deploying to Vercel (or running in Next.js), configure the following environment variables in your project settings:
                </p>
                <div className="bg-black/60 border border-white/5 p-3 rounded font-mono text-[11px] text-emerald-400 space-y-1">
                  <div>NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co</div>
                  <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here</div>
                </div>
              </div>

              <div className="p-4 rounded bg-white/[0.02] border border-white/5 space-y-2">
                <h4 className="font-semibold text-white text-sm">Next.js Client Connection Pattern</h4>
                <p className="text-[#8e9299]">
                  The application uses the official @supabase/supabase-js client. It automatically detects both NEXT_PUBLIC_SUPABASE_* and VITE_SUPABASE_* conventions so your code works identically across local dev, Vite, and Vercel Next.js deployments.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-white/10 bg-black/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-xs uppercase tracking-widest font-bold bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
