# Notify

Notify is a centralized, dark-mode personal "Life OS" dashboard designed to replace scattered tracking applications. It unifies daily checklists, real-time work telemetry, and financial logging into a single, cohesive interface.

## System Architecture

* **Frontend:** React 18 running on the Vite build engine for rapid client-side performance.
* **Routing:** React Router v6 managing stateless view segmentation.
* **Backend:** Supabase client integration leveraging PostgreSQL relational mapping.
* **Security:** Row Level Security (RLS) tracking verified identities via token exchange.
* **Deployment:** Optimized for serverless hosting environments like Vercel.

## Core Directory Structure

src/
├── assets/             # Core resets and dark-mode stylesheets
├── components/         # Global navigation and layout shells
├── config/             # Database clients (supabase.js)
├── features/           # Modular pillar configurations
│   ├── auth/           # Identity gateways
│   ├── dashboard/      # Unified metric trackers
│   ├── finance/        # Ledger tracking (Ledger, Bills, Savings)
│   ├── personal/       # Daily operations (Tasks, Habits, Notes)
│   └── work/           # Production monitoring (Timer, Inventories, Logs)
├── App.jsx             # State boundaries and system routers
└── main.jsx            # Application mount initialization

## Database Schema Configuration

Execute the following relational blueprints inside your database console to instantiate the storage schemas:

```sql
-- Work Pillar Tables
create table projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  deadline date,
  status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table time_logs (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  start_time timestamp with time zone default timezone('utc'::text, now()) not null,
  end_time timestamp with time zone,
  duration_minutes integer
);

-- Personal Pillar Tables
create table tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  is_completed boolean default false,
  due_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table habits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table habit_logs (
  id uuid default gen_random_uuid() primary key,
  habit_id uuid references habits(id) on delete cascade not null,
  completed_date date not null default current_date
);

create table notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  content text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Finance Pillar Tables
create table transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  description text not null,
  amount numeric(10, 2) not null,
  type text not null check (type in ('income', 'expense')),
  category text,
  date date not null default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  cost numeric(10, 2) not null,
  billing_cycle text default 'monthly' check (billing_cycle in ('monthly', 'yearly')),
  next_billing_date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table savings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  target_amount numeric(10, 2) not null,
  current_amount numeric(10, 2) default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security Activation
alter table projects enable row level security;
alter table time_logs enable row level security;
alter table tasks enable row level security;
alter table habits enable row level security;
alter table habit_logs enable row level security;
alter table notes enable row level security;
alter table transactions enable row level security;
alter table subscriptions enable row level security;
alter table savings enable row level security;

-- Global Security Policy Sets
create policy "User boundaries: projects" on projects for all using (auth.uid() = user_id);
create policy "User boundaries: time_logs" on time_logs for all using (auth.uid() = user_id);
create policy "User boundaries: tasks" on tasks for all using (auth.uid() = user_id);
create policy "User boundaries: habits" on habits for all using (auth.uid() = user_id);
create policy "User boundaries: notes" on notes for all using (auth.uid() = user_id);
create policy "User boundaries: transactions" on transactions for all using (auth.uid() = user_id);
create policy "User boundaries: subscriptions" on subscriptions for all using (auth.uid() = user_id);
create policy "User boundaries: savings" on savings for all using (auth.uid() = user_id);
create policy "User boundaries: habit_logs" on habit_logs for all using (
  exists (select 1 from habits where habits.id = habit_logs.habit_id and habits.user_id = auth.uid())
);
\```

## Setup Protocol

**1. Clone environmental assets and structure dependencies:**
\```bash
git clone [github.com/yourusername/notify.git](https://github.com/yourusername/notify.git)
cd notify
npm install
\```

**2. Declare network variables:**
Instantiate a secure token file named `.env.local` inside the absolute project root directory:
\```text
VITE_SUPABASE_URL=your-instance-hash.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-api-token
\```

**3. Run local testing matrix:**
\```bash
npm run dev
\```
Navigate your browser interface to `localhost:5173` to register a test administrative user profile.