-- Invite Code System for Space Whale Portal
-- This script creates the necessary tables for invite-only access

-- Create invite_codes table
CREATE TABLE IF NOT EXISTS public.invite_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  max_uses INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invite_code_usage table to track multiple uses
CREATE TABLE IF NOT EXISTS public.invite_code_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invite_code_id UUID REFERENCES public.invite_codes(id) ON DELETE CASCADE NOT NULL,
  used_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(invite_code_id, used_by)
);

-- Enable RLS on invite tables
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_code_usage ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Admin users can view all invite codes" ON public.invite_codes;
DROP POLICY IF EXISTS "Admin users can create invite codes" ON public.invite_codes;
DROP POLICY IF EXISTS "Admin users can update invite codes" ON public.invite_codes;
DROP POLICY IF EXISTS "Admin users can delete invite codes" ON public.invite_codes;
DROP POLICY IF EXISTS "Users can view invite code usage" ON public.invite_code_usage;
DROP POLICY IF EXISTS "Admin users can manage invite code usage" ON public.invite_code_usage;

-- Create RLS policies for invite_codes
CREATE POLICY "Admin users can view all invite codes"
ON public.invite_codes FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'lizwamc@gmail.com'
  )
);

CREATE POLICY "Admin users can create invite codes"
ON public.invite_codes FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = created_by AND
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'lizwamc@gmail.com'
  )
);

CREATE POLICY "Admin users can update invite codes"
ON public.invite_codes FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'lizwamc@gmail.com'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'lizwamc@gmail.com'
  )
);

CREATE POLICY "Admin users can delete invite codes"
ON public.invite_codes FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'lizwamc@gmail.com'
  )
);

-- Create RLS policies for invite_code_usage
CREATE POLICY "Users can view invite code usage"
ON public.invite_code_usage FOR SELECT
TO authenticated
USING (used_by = auth.uid());

CREATE POLICY "Admin users can manage invite code usage"
ON public.invite_code_usage FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'lizwamc@gmail.com'
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON public.invite_codes(code);
CREATE INDEX IF NOT EXISTS idx_invite_codes_created_by ON public.invite_codes(created_by);
CREATE INDEX IF NOT EXISTS idx_invite_codes_expires_at ON public.invite_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_invite_codes_is_active ON public.invite_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_invite_code_usage_invite_code_id ON public.invite_code_usage(invite_code_id);
CREATE INDEX IF NOT EXISTS idx_invite_code_usage_used_by ON public.invite_code_usage(used_by);

-- Create function to validate invite code
CREATE OR REPLACE FUNCTION validate_invite_code(invite_code TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.invite_codes 
    WHERE code = invite_code 
    AND is_active = true 
    AND (expires_at IS NULL OR expires_at > NOW())
    AND current_uses < max_uses
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to use invite code
CREATE OR REPLACE FUNCTION use_invite_code(invite_code TEXT, user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  invite_record RECORD;
BEGIN
  -- Get the invite code record
  SELECT * INTO invite_record 
  FROM public.invite_codes 
  WHERE code = invite_code 
  AND is_active = true 
  AND (expires_at IS NULL OR expires_at > NOW())
  AND current_uses < max_uses;
  
  -- If no valid invite code found, return false
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user has already used this code
  IF EXISTS (
    SELECT 1 FROM public.invite_code_usage 
    WHERE invite_code_id = invite_record.id 
    AND used_by = user_id
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Record the usage
  INSERT INTO public.invite_code_usage (invite_code_id, used_by)
  VALUES (invite_record.id, user_id);
  
  -- Update the usage count
  UPDATE public.invite_codes 
  SET current_uses = current_uses + 1,
      updated_at = NOW()
  WHERE id = invite_record.id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert some initial invite codes for testing
INSERT INTO public.invite_codes (code, created_by, max_uses, expires_at) VALUES
('SPACEWHALE2025', (SELECT id FROM auth.users WHERE email = 'lizwamc@gmail.com' LIMIT 1), 10, NOW() + INTERVAL '30 days'),
('BETA-TESTER', (SELECT id FROM auth.users WHERE email = 'lizwamc@gmail.com' LIMIT 1), 5, NOW() + INTERVAL '14 days'),
('COMMUNITY-FRIEND', (SELECT id FROM auth.users WHERE email = 'lizwamc@gmail.com' LIMIT 1), 3, NOW() + INTERVAL '7 days');

-- Verify tables were created
SELECT 
  'Invite System Status' as status,
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('invite_codes', 'invite_code_usage')
ORDER BY table_name;

-- Show created functions
SELECT 
  'Invite Functions' as status,
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE '%invite%'
ORDER BY routine_name;
