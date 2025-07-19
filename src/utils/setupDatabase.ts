import { supabase } from '../lib/supabase';

const createTablesSQL = `
-- Enable UUID extension (might already exist)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'unpaid', 'trialing');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE plan_type AS ENUM ('free', 'pro', 'enterprise');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id text UNIQUE,
  stripe_customer_id text,
  status subscription_status NOT NULL DEFAULT 'active',
  plan_type plan_type NOT NULL DEFAULT 'free',
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  site_url text NOT NULL,
  description text,
  framework jsonb DEFAULT '{"framework": "HTML/CSS/JS", "confidence": 50, "indicators": ["Default detection"]}'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create components table
CREATE TABLE IF NOT EXISTS public.components (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  component_type text NOT NULL,
  content jsonb NOT NULL,
  position integer DEFAULT 0,
  is_visible boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.components ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for subscriptions
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own subscription" ON public.subscriptions;
CREATE POLICY "Users can insert own subscription" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscriptions;
CREATE POLICY "Users can update own subscription" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for projects
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
CREATE POLICY "Users can view own projects" ON public.projects
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own projects" ON public.projects;
CREATE POLICY "Users can insert own projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
CREATE POLICY "Users can update own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;
CREATE POLICY "Users can delete own projects" ON public.projects
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for components
DROP POLICY IF EXISTS "Users can view components of own projects" ON public.components;
CREATE POLICY "Users can view components of own projects" ON public.components
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = components.project_id
      AND projects.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert components to own projects" ON public.components;
CREATE POLICY "Users can insert components to own projects" ON public.components
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = components.project_id
      AND projects.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update components of own projects" ON public.components;
CREATE POLICY "Users can update components of own projects" ON public.components
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = components.project_id
      AND projects.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete components of own projects" ON public.components;
CREATE POLICY "Users can delete components of own projects" ON public.components
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = components.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_components_project_id ON public.components(project_id);
`;

export const setupDatabase = async () => {
  try {
    console.log('🚀 Setting up database schema...');
    
    // Execute the SQL to create tables
    const { error } = await supabase.rpc('exec_sql', { 
      sql: createTablesSQL 
    });

    if (error) {
      console.error('Error setting up database:', error);
      throw error;
    }

    console.log('✅ Database schema created successfully!');
    return { success: true };

  } catch (error) {
    console.error('Failed to setup database:', error);
    
    // Try alternative method - create tables individually
    try {
      console.log('Trying alternative setup method...');
      
      // Create subscriptions table directly
      const { error: subError } = await supabase
        .from('subscriptions')
        .select('id')
        .limit(1);
      
      if (subError && subError.code === 'PGRST116') {
        // Table doesn't exist, but we can't create it via REST API
        console.log('⚠️ Database tables need to be created via Supabase SQL Editor');
        console.log('Please run the SQL schema in the Supabase dashboard.');
        return { success: false, needsManualSetup: true };
      }
      
    } catch (altError) {
      console.error('Alternative setup also failed:', altError);
    }

    return { success: false, error };
  }
};

export const checkDatabaseSetup = async () => {
  try {
    // Check if required tables exist by trying to query them
    const tables = ['subscriptions', 'projects', 'components'];
    const results = await Promise.allSettled(
      tables.map(table => 
        supabase.from(table).select('id').limit(1)
      )
    );

    const missingTables = tables.filter((table, index) => {
      const result = results[index];
      return result.status === 'rejected' || 
             (result.status === 'fulfilled' && result.value.error?.code === 'PGRST116');
    });

    if (missingTables.length > 0) {
      console.log('❌ Missing tables:', missingTables);
      return { ready: false, missingTables };
    }

    console.log('✅ All required tables exist');
    return { ready: true };

  } catch (error) {
    console.error('Error checking database setup:', error);
    return { ready: false, error };
  }
};