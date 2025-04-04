
-- Create a function to get auth logs for a user
CREATE OR REPLACE FUNCTION public.get_auth_logs_for_user(user_id_param UUID, limit_param INTEGER)
RETURNS SETOF auth_logs
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM auth_logs
  WHERE user_id = user_id_param
  ORDER BY created_at DESC
  LIMIT limit_param;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_auth_logs_for_user TO authenticated;
