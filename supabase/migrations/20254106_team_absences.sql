
-- Create the team_absences table for tracking team member absences
CREATE TABLE IF NOT EXISTS public.team_absences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add row level security
ALTER TABLE public.team_absences ENABLE ROW LEVEL SECURITY;

-- Create policies that allow users to view their own absences
CREATE POLICY "Users can view their own absences"
  ON public.team_absences
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policies that allow users to insert their own absences
CREATE POLICY "Users can create their own absences"
  ON public.team_absences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policies that allow admin to view all absences
CREATE POLICY "Admins can view all absences"
  ON public.team_absences
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Create policies that allow admin to update all absences
CREATE POLICY "Admins can update all absences"
  ON public.team_absences
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
    )
  );
