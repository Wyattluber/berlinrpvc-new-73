
CREATE TABLE IF NOT EXISTS public.store_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ROBUX' CHECK (currency IN ('EUR', 'ROBUX')),
  image_url TEXT,
  product_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.store_items ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access" 
ON public.store_items 
FOR SELECT 
USING (true);

-- Create policy for admin insert/update/delete
CREATE POLICY "Allow admin insert"
ON public.store_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND (role = 'admin' OR role = 'moderator')
  )
);

CREATE POLICY "Allow admin update"
ON public.store_items
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND (role = 'admin' OR role = 'moderator')
  )
);

CREATE POLICY "Allow admin delete"
ON public.store_items
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND (role = 'admin' OR role = 'moderator')
  )
);

-- Add timestamp trigger for updated_at
DROP TRIGGER IF EXISTS store_items_updated_at ON public.store_items;
CREATE TRIGGER store_items_updated_at
BEFORE UPDATE ON public.store_items
FOR EACH ROW
EXECUTE FUNCTION public.update_timestamp();
