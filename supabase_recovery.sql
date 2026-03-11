-- 1. Create the student_profiles table
create table if not exists public.student_profiles (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id uuid references auth.users not null unique,
    full_name text,
    email text,
    ats_score numeric,
    experience_years numeric,
    skills_detected text[],
    missing_skills text[],
    summary text,
    inferred_interests text[]
);

-- 2. Enable Row Level Security (RLS)
alter table public.student_profiles enable row level security;

-- 3. Create policies
-- Allow users to view their own profile
create policy "Users can view their own profile"
on public.student_profiles for select
using ( auth.uid() = user_id );

-- Allow users to insert their own profile
create policy "Users can insert their own profile"
on public.student_profiles for insert
with check ( auth.uid() = user_id );

-- Allow users to update their own profile
create policy "Users can update their own profile"
on public.student_profiles for update
using ( auth.uid() = user_id );

-- Allow users to delete their own profile
create policy "Users can delete their own profile"
on public.student_profiles for delete
using ( auth.uid() = user_id );
