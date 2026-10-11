# Supabase Setup Guide

Follow these steps to set up your database and create the student user account.

## Step 1: Run Database Schema

1. Go to your Supabase project: https://supabase.com/dashboard/project/inulencomnwpnbrteryc
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste this SQL:

```sql
-- Create profiles table
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  email text,
  role text check (role in ('student', 'admin', 'mentor')),
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  primary key (id)
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );
```

5. Click **Run** (or press Cmd/Ctrl + Enter)

## Step 2: Create User Account

### Option A: Via Supabase Dashboard (Recommended)

1. In your Supabase dashboard, go to **Authentication** → **Users**
2. Click **Add User** → **Create New User**
3. Fill in:
   - **Email**: abhijeet@calibrate.edu (or any email you prefer)
   - **Password**: 0176
   - **Auto Confirm User**: ✅ Check this box
4. Click **Create User**

### Option B: Via Registration Page

1. Go to http://localhost:3000/auth/register
2. Fill in:
   - **Full Name**: Abhijeet Senapati
   - **Email**: abhijeet@calibrate.edu
   - **Role**: Student
   - **Password**: 0176
3. Click **Sign Up**
4. Check your email and confirm (or use Option A with auto-confirm)

## Step 3: Add Profile Data

After creating the user, you need to add the profile:

1. Go to **SQL Editor** again
2. Run this query (replace `USER_ID` with the actual user ID from Authentication → Users):

```sql
-- First, get the user ID
SELECT id, email FROM auth.users WHERE email = 'abhijeet@calibrate.edu';

-- Then insert the profile (replace 'USER_ID_HERE' with the actual ID)
INSERT INTO public.profiles (id, email, role, full_name)
VALUES (
  'USER_ID_HERE',
  'abhijeet@calibrate.edu',
  'student',
  'Abhijeet Senapati'
);
```

Or use this single query:

```sql
INSERT INTO public.profiles (id, email, role, full_name)
SELECT id, email, 'student', 'Abhijeet Senapati'
FROM auth.users 
WHERE email = 'abhijeet@calibrate.edu';
```

## Step 4: Test Login

1. Go to http://localhost:3000/auth/login
2. Login with:
   - **Email**: abhijeet@calibrate.edu
   - **Password**: 0176
3. You should be redirected to `/student/feed`

---

**After completing these steps, let me know and I'll re-enable authentication in the code!**
