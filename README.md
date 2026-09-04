# Quantum Gazipur cell, Raji sir Team Daily Checklist

A modern, high-contrast Daily Checklist and accountability tracking web application engineered for **Quantum Gazipur cell (Raji sir Team)** to manage 20 core operational tasks, track real-time completion progress, record reasons for pending items, and synchronize records with **Supabase Cloud Database**.

---

## Features

- **20 Pre-Seeded Daily Tasks**: Pre-configured operational workflow with custom status and order.
- **Glassmorphism Executive UI**: Sleek, distraction-free interface with green completion indicators.
- **Real-Time Progress Metrics**: Sticky progress bar, percentage completion, and Done vs. Remaining counts.
- **Accountability Logs**: Incomplete tasks automatically prompt for a pending reason with 1-click presets and custom notes.
- **Supabase Cloud Synchronization**: Instant sync with Supabase PostgreSQL database and offline localStorage fallback.
- **Date Navigation & Historical Records**: Browse past days, track daily completion history, and review archived accountability logs.
- **Executive Print & Export**: Ready-to-print sign-off reports, CSV export, and JSON backups.
- **Dynamic Task Manager**: Add custom recurring tasks, edit task names, reorder, or toggle active status.

---

## Deploying to GitHub & Vercel

### Step 1: Export from AI Studio to GitHub
1. In Google AI Studio, click the **Settings (⚙️)** or menu icon in the top-right corner.
2. Select **"Export to GitHub"** (or **"Connect to GitHub"**).
3. Authorize your GitHub account and choose a repository name (e.g. `quantum-gazipur-daily-checklist`).
4. Click **Export** — all source files and Supabase migrations will be automatically pushed to your GitHub repository!

### Step 2: Deploy to Vercel
1. Go to [vercel.com/new](https://vercel.com/new).
2. Import your newly created GitHub repository.
3. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL` = your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase Anon Key
4. Click **Deploy**. Your app will be live on a fast global CDN with automated updates on every Git push!

---

## Database Migration & Schema (Supabase)

Run the following SQL in your **Supabase Dashboard > SQL Editor**:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Daily Logs Table
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

-- 2. Task Templates Table
CREATE TABLE IF NOT EXISTS public.task_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    category TEXT DEFAULT 'Operations',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. High Performance Indexes
CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON public.daily_logs(date);
CREATE INDEX IF NOT EXISTS idx_daily_logs_status ON public.daily_logs(status);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read daily_logs" ON public.daily_logs FOR SELECT USING (true);
CREATE POLICY "Allow public write daily_logs" ON public.daily_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read task_templates" ON public.task_templates FOR SELECT USING (true);
CREATE POLICY "Allow public write task_templates" ON public.task_templates FOR ALL USING (true) WITH CHECK (true);

-- 5. Pre-seed Mina's 20 Core Tasks
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
ON CONFLICT (name) DO UPDATE SET order_index = EXCLUDED.order_index;
```

---

## Environment Configuration

Configure the following variables in `.env` (or in your Vercel Project Settings):

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# For Vite environments:
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Vercel / Next.js Deployment

1. Push this repository to GitHub.
2. In [Vercel](https://vercel.com), click **Add New Project** and import the repository.
3. In the **Environment Variables** section, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**.
