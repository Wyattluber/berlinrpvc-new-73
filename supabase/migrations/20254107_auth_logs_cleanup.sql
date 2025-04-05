
-- Create a function to clean up old auth logs, keeping only the most recent ones per user
CREATE OR REPLACE FUNCTION clean_old_auth_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete all but the 5 most recent logs for each user
  DELETE FROM auth_logs
  WHERE id IN (
    SELECT id FROM (
      SELECT id, user_id,
        ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as row_num
      FROM auth_logs
    ) ranked
    WHERE row_num > 5
  );
END;
$$;

-- Create a trigger function that will be called after insert
CREATE OR REPLACE FUNCTION trigger_clean_auth_logs()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Call the cleanup function
  PERFORM clean_old_auth_logs();
  RETURN NEW;
END;
$$;

-- Create a trigger to clean up logs after each insert
DROP TRIGGER IF EXISTS after_auth_log_insert ON auth_logs;

CREATE TRIGGER after_auth_log_insert
AFTER INSERT ON auth_logs
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_clean_auth_logs();

-- Create a function to get recent auth logs for a user
CREATE OR REPLACE FUNCTION get_recent_auth_logs(user_id_param UUID)
RETURNS TABLE (
  id UUID,
  created_at TIMESTAMPTZ,
  event_type TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT l.id, l.created_at, l.event_type, l.ip_address, l.user_agent, l.metadata
  FROM auth_logs l
  WHERE l.user_id = user_id_param
  ORDER BY l.created_at DESC
  LIMIT 5;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_recent_auth_logs TO authenticated;
