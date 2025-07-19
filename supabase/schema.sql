-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create enum types
create type subscription_status as enum ('active', 'canceled', 'past_due', 'unpaid', 'trialing');
create type plan_type as enum ('free', 'pro', 'enterprise');

-- Create users table (extends auth.users)
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create subscriptions table
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  stripe_subscription_id text unique,
  stripe_customer_id text,
  status subscription_status not null default 'free',
  plan_type plan_type not null default 'free',
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create projects table
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  site_url text not null,
  description text,
  framework jsonb default '{"framework": "HTML/CSS/JS", "confidence": 50, "indicators": ["Default detection"]}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create components table
create table public.components (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  component_type text not null,
  content jsonb not null,
  position integer default 0,
  is_visible boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create RLS policies
alter table public.users enable row level security;
alter table public.subscriptions enable row level security;
alter table public.projects enable row level security;
alter table public.components enable row level security;

-- Users policies
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.users
  for insert with check (auth.uid() = id);

-- Subscriptions policies
create policy "Users can view own subscription" on public.subscriptions
  for select using (auth.uid() = user_id);

create policy "Users can insert own subscription" on public.subscriptions
  for insert with check (auth.uid() = user_id);

create policy "Users can update own subscription" on public.subscriptions
  for update using (auth.uid() = user_id);

-- Projects policies
create policy "Users can view own projects" on public.projects
  for select using (auth.uid() = user_id);

create policy "Users can insert own projects" on public.projects
  for insert with check (auth.uid() = user_id);

create policy "Users can update own projects" on public.projects
  for update using (auth.uid() = user_id);

create policy "Users can delete own projects" on public.projects
  for delete using (auth.uid() = user_id);

-- Components policies
create policy "Users can view components of own projects" on public.components
  for select using (
    exists (
      select 1 from public.projects
      where projects.id = components.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can insert components to own projects" on public.components
  for insert with check (
    exists (
      select 1 from public.projects
      where projects.id = components.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can update components of own projects" on public.components
  for update using (
    exists (
      select 1 from public.projects
      where projects.id = components.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can delete components of own projects" on public.components
  for delete using (
    exists (
      select 1 from public.projects
      where projects.id = components.project_id
      and projects.user_id = auth.uid()
    )
  );

-- Create indexes for performance
create index idx_subscriptions_user_id on public.subscriptions(user_id);
create index idx_subscriptions_stripe_subscription_id on public.subscriptions(stripe_subscription_id);
create index idx_projects_user_id on public.projects(user_id);
create index idx_components_project_id on public.components(project_id);

-- Create updated_at triggers
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger handle_users_updated_at
  before update on public.users
  for each row execute function public.handle_updated_at();

create trigger handle_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.handle_updated_at();

create trigger handle_projects_updated_at
  before update on public.projects
  for each row execute function public.handle_updated_at();

create trigger handle_components_updated_at
  before update on public.components
  for each row execute function public.handle_updated_at();

-- Function to create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  
  -- Create default free subscription
  insert into public.subscriptions (user_id, status, plan_type)
  values (new.id, 'active', 'free');
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create user profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();