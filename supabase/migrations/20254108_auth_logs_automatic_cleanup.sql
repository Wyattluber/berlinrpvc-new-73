
-- Function to delete all auth logs EXCEPT the most recent 5 per user
CREATE OR REPLACE FUNCTION clean_old_auth_logs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  logs_deleted INTEGER := 0;
  user_rec RECORD;
BEGIN
  -- For each user who has auth logs
  FOR user_rec IN (SELECT DISTINCT user_id FROM auth_logs) LOOP
    -- Delete all but the most recent 5 logs for this user
    DELETE FROM auth_logs
    WHERE id IN (
      SELECT id FROM auth_logs
      WHERE user_id = user_rec.user_id
      ORDER BY created_at DESC
      OFFSET 5
    );
    
    GET DIAGNOSTICS logs_deleted = ROW_COUNT;
  END LOOP;
  
  RETURN logs_deleted;
END;
$$;

-- Create a function that can be called from the client to run the cleanup
-- for the current user's logs (more selective than running full cleanup)
CREATE OR REPLACE FUNCTION cleanup_my_auth_logs() 
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Safety check: make sure we have a user
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Delete all but the 5 most recent logs for the current user
  DELETE FROM auth_logs
  WHERE id IN (
    SELECT id FROM auth_logs
    WHERE user_id = auth.uid()
    ORDER BY created_at DESC
    OFFSET 5
  );
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;

-- Create a trigger to automatically clean up old logs when new ones are inserted
CREATE OR REPLACE FUNCTION trigger_cleanup_auth_logs()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete all logs for this user beyond the most recent 5
  DELETE FROM auth_logs
  WHERE id IN (
    SELECT id FROM auth_logs
    WHERE user_id = NEW.user_id
    ORDER BY created_at DESC
    OFFSET 5
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger to run the cleanup after each insert
DROP TRIGGER IF EXISTS trig_cleanup_auth_logs ON auth_logs;
CREATE TRIGGER trig_cleanup_auth_logs
AFTER INSERT ON auth_logs
FOR EACH ROW
EXECUTE FUNCTION trigger_cleanup_auth_logs();

COMMENT ON FUNCTION clean_old_auth_logs() IS 'Removes all auth logs except the 5 most recent per user';
COMMENT ON FUNCTION cleanup_my_auth_logs() IS 'Removes all but the 5 most recent auth logs for the current user';
