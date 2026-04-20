-- Step 1: Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  monthly_budget DECIMAL(10,2) DEFAULT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists (for idempotency)
DROP POLICY IF EXISTS "Users manage own preferences" ON public.user_preferences;

-- Create Policy
CREATE POLICY "Users manage own preferences" ON public.user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Optional: Grant access to service role for backend operations
GRANT ALL ON public.user_preferences TO service_role;
GRANT ALL ON public.user_preferences TO postgres;
