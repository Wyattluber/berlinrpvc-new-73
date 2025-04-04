
-- Create a table for auth logs
CREATE TABLE IF NOT EXISTS public.auth_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_auth_logs_user_id ON public.auth_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_logs_created_at ON public.auth_logs(created_at);

-- Enable RLS
ALTER TABLE public.auth_logs ENABLE ROW LEVEL SECURITY;

-- Set up RLS policies
CREATE POLICY "Users can view their own auth logs" 
  ON public.auth_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Insert auth logs" 
  ON public.auth_logs 
  FOR INSERT 
  WITH CHECK (true);

-- Grant permissions to authenticated users
GRANT SELECT ON public.auth_logs TO authenticated;
GRANT INSERT ON public.auth_logs TO authenticated;
