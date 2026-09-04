import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Terminal,
  ShieldCheck,
} from 'lucide-react';
import { getStoredSupabaseConfig, testConnection } from '../lib/supabase';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
}

const SQL_SCHEMA_CONTENT = `-- Quantum Gazipur cell, Raji sir Team - Supabase Database Schema
-- Run in Supabase SQL Editor (https://supabase.com/dashboard)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Daily Logs Table (stores daily task status and accountability reasons)
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

-- 2. Task Templates Table (for dynamic add/edit/delete of tasks)
CREATE TABLE IF NOT EXISTS public.task_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    category TEXT DEFAULT 'Operations',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON public.daily_logs(date);
CREATE INDEX IF NOT EXISTS idx_daily_logs_status ON public.daily_logs(status);

-- 4. Enable Row Level Security (RLS) & Policies
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read daily_logs" ON public.daily_logs FOR SELECT USING (true);
CREATE POLICY "Allow public write daily_logs" ON public.daily_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read task_templates" ON public.task_templates FOR SELECT USING (true);
CREATE POLICY "Allow public write task_templates" ON public.task_templates FOR ALL USING (true) WITH CHECK (true);

-- 5. Seed Quantum Gazipur cell, Raji sir Team's 20 Core Tasks
INSERT INTO public.task_templates (name, order_index, category)
VALUES
    ('Desk Set-up', 1, 'Morning Routine'),
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
ON CONFLICT (name) DO UPDATE SET order_index = EXCLUDED.order_index;`;

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved,
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'schema' | 'vercel'>('config');

  useEffect(() => {
    if (isOpen) {
      const current = getStoredSupabaseConfig();
      setUrl(current.url);
      setAnonKey(current.anonKey);
      if (current.isConfigured) {
        setStatusMsg({ type: 'success', text: 'Supabase credentials currently active and verified.' });
      } else {
        setStatusMsg({
          type: 'info',
          text: 'Running in Local Storage Mode. Add your Supabase credentials below or in your environment variables for cloud sync.',
        });
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) {
      setStatusMsg({ type: 'error', text: 'Please enter both Supabase Project URL and Anon Public Key.' });
      return;
    }

    setIsTesting(true);
    setStatusMsg({ type: 'info', text: 'Connecting to Supabase...' });

    const result = await testConnection(url.trim(), anonKey.trim());
    setIsTesting(false);

    if (result.success) {
      localStorage.setItem('MINA_SUPABASE_URL', url.trim());
      localStorage.setItem('MINA_SUPABASE_ANON_KEY', anonKey.trim());
      setStatusMsg({ type: 'success', text: result.message });
      onConfigSaved();
    } else {
      setStatusMsg({ type: 'error', text: result.message });
    }
  };

  const handleClear = () => {
    localStorage.removeItem('MINA_SUPABASE_URL');
    localStorage.removeItem('MINA_SUPABASE_ANON_KEY');
    setUrl('');
    setAnonKey('');
    setStatusMsg({ type: 'info', text: 'Supabase keys removed. Returned to Local Storage Mode.' });
    onConfigSaved();
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_CONTENT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded bg-[#0a0a0a] border border-white/10 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">Supabase Cloud Database &amp; Schema</h2>
              <p className="text-xs text-[#8e9299]">
                Persistent backend for daily checklist logs &amp; incomplete reason records
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-[#8e9299] hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-white/10 px-6 bg-black/40">
          <button
            onClick={() => setActiveTab('config')}
            className={`py-3 px-4 text-xs uppercase tracking-wider font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'config'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-[#8e9299] hover:text-[#e5e5e5]'
            }`}
          >
            <Database className="w-3.5 h-3.5" /> Connection &amp; Keys
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`py-3 px-4 text-xs uppercase tracking-wider font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'schema'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-[#8e9299] hover:text-[#e5e5e5]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" /> SQL Migration Schema
          </button>
          <button
            onClick={() => setActiveTab('vercel')}
            className={`py-3 px-4 text-xs uppercase tracking-wider font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'vercel'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-[#8e9299] hover:text-[#e5e5e5]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Next.js &amp; Vercel Guide
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* TAB 1: Config */}
          {activeTab === 'config' && (
            <div className="space-y-4">
              {/* Bengali quick instruction banner */}
              <div className="p-3.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-xs text-[#e5e5e5] space-y-1.5">
                <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                  <Database className="w-4 h-4" />
                  সুপাবেস (Supabase) ডাটাবেস যুক্ত করার ধাপসমূহ:
                </div>
                <ol className="list-decimal list-inside text-xs text-[#8e9299] space-y-1 leading-relaxed">
                  <li><strong className="text-white">Supabase Dashboard</strong> (supabase.com) এ লগইন করে আপনার প্রজেক্ট ওপেন করুন।</li>
                  <li><strong className="text-white">Project Settings &gt; API</strong> থেকে <strong>Project URL</strong> এবং <strong>anon (public) key</strong> কপি করুন।</li>
                  <li>নিচের ঘরে বসিয়ে <strong className="text-emerald-400">"Test &amp; Connect"</strong> বাটনে ক্লিক করুন।</li>
                  <li>উপরে <strong>"SQL Migration Schema"</strong> ট্যাবে গিয়ে কোড কপি করে Supabase SQL Editor-এ রান করে নিন।</li>
                </ol>
              </div>

              {statusMsg && (
                <div
                  className={`p-3.5 rounded text-xs flex items-start gap-2.5 ${
                    statusMsg.type === 'success'
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                      : statusMsg.type === 'error'
                      ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                      : 'bg-white/5 text-[#e5e5e5] border border-white/10'
                  }`}
                >
                  {statusMsg.type === 'success' && <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400 mt-0.5" />}
                  {statusMsg.type === 'error' && <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />}
                  {statusMsg.type === 'info' && <Database className="w-4 h-4 flex-shrink-0 text-amber-400 mt-0.5" />}
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
                    Clear Credentials (Use Local Storage)
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={isTesting}
                      className="px-4 py-2 rounded text-xs uppercase tracking-widest font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50"
                    >
                      {isTesting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Testing Connection...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Test &amp; Connect
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>

              <div className="mt-4 p-4 rounded bg-white/[0.02] border border-white/5 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Offline-First &amp; Automatic Synchronization:
                </div>
                <p className="text-xs text-[#8e9299] leading-relaxed">
                  The application is engineered with an offline-first architecture. When Supabase is connected, all checklist toggles and reasons for incomplete tasks are instantly synchronized with your cloud database. If Supabase is offline or not yet configured, all records are stored reliably in your browser's local storage.
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
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs uppercase tracking-wider font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL Schema'}</span>
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
                  The application uses the official <code className="text-emerald-400 font-mono">@supabase/supabase-js</code> client. It automatically detects both <code className="text-emerald-400 font-mono">NEXT_PUBLIC_SUPABASE_*</code> and <code className="text-emerald-400 font-mono">VITE_SUPABASE_*</code> conventions so your code works identically across local dev, Vite, and Vercel Next.js deployments.
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
