
-- Create a function to delete old auth logs
CREATE OR REPLACE FUNCTION public.cleanup_old_auth_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete auth logs older than 30 days
  DELETE FROM public.auth_logs
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$;

-- Create a cron job to run the cleanup function daily
-- This requires the pg_cron extension to be enabled
SELECT cron.schedule(
  'cleanup_auth_logs_daily',  -- name of the cron job
  '0 3 * * *',               -- run at 3am every day
  $$SELECT public.cleanup_old_auth_logs()$$
);

-- Enable RLS for server_stats table
ALTER TABLE IF EXISTS public.server_stats ENABLE ROW LEVEL SECURITY;

-- Admin policy for server_stats
CREATE POLICY "Admin users can manage server stats" 
ON public.server_stats 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'moderator')
  )
);

-- Everyone can view server stats
CREATE POLICY "Everyone can view server stats" 
ON public.server_stats 
FOR SELECT 
USING (true);
