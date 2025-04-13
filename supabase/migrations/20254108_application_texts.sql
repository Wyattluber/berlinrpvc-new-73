
-- Create the application_texts table if it doesn't exist
CREATE OR REPLACE FUNCTION public.create_application_texts_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the table already exists
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'application_texts'
  ) THEN
    -- Create the table
    CREATE TABLE public.application_texts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      team_description TEXT NOT NULL,
      partnership_description TEXT NOT NULL,
      requirements_description TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Apply RLS
    ALTER TABLE public.application_texts ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Allow all users to read application_texts"
      ON public.application_texts
      FOR SELECT
      USING (true);

    CREATE POLICY "Allow authenticated users to insert application_texts"
      ON public.application_texts
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.admin_users
          WHERE user_id = auth.uid()
          AND role IN ('admin')
        )
      );

    CREATE POLICY "Allow admins to update application_texts"
      ON public.application_texts
      FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.admin_users
          WHERE user_id = auth.uid()
          AND role IN ('admin')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.admin_users
          WHERE user_id = auth.uid()
          AND role IN ('admin')
        )
      );

    -- Create index
    CREATE INDEX application_texts_updated_at_idx ON public.application_texts (updated_at DESC);
  END IF;
END;
$$;

-- Create the setup function
CREATE OR REPLACE FUNCTION public.setup_application_texts_function()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create the create_application_texts_table function if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM pg_proc
    WHERE proname = 'create_application_texts_table'
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    -- The function is created above, so nothing to do here
    RAISE NOTICE 'Function create_application_texts_table already exists.';
  END IF;
END;
$$;

-- Grant access to the functions
GRANT EXECUTE ON FUNCTION public.create_application_texts_table TO authenticated;
GRANT EXECUTE ON FUNCTION public.setup_application_texts_function TO authenticated;
