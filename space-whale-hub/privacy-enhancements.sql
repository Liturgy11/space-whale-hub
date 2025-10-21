-- Enhanced Privacy & Security for Space Whale Hub
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. ENHANCED JOURNAL ENTRIES PRIVACY
-- ============================================

-- Add privacy settings to journal entries
ALTER TABLE public.journal_entries 
ADD COLUMN IF NOT EXISTS is_encrypted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS retention_policy TEXT DEFAULT 'indefinite',
ADD COLUMN IF NOT EXISTS access_log JSONB DEFAULT '[]';

-- Create function to log access
CREATE OR REPLACE FUNCTION log_journal_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if user is accessing their own entry
  IF auth.uid() = NEW.user_id THEN
    NEW.access_log = COALESCE(NEW.access_log, '[]'::jsonb) || 
      jsonb_build_object('accessed_at', NOW(), 'ip_address', inet_client_addr());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for access logging
CREATE TRIGGER log_journal_access_trigger
  BEFORE UPDATE ON public.journal_entries
  FOR EACH ROW EXECUTE FUNCTION log_journal_access();

-- ============================================
-- 2. DATA RETENTION POLICIES
-- ============================================

-- Function to clean up old data based on retention policy
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS void AS $$
BEGIN
  -- Delete journal entries older than retention period
  DELETE FROM public.journal_entries 
  WHERE retention_policy != 'indefinite' 
  AND created_at < CASE 
    WHEN retention_policy = '30days' THEN NOW() - INTERVAL '30 days'
    WHEN retention_policy = '6months' THEN NOW() - INTERVAL '6 months'
    WHEN retention_policy = '1year' THEN NOW() - INTERVAL '1 year'
    ELSE NOW() - INTERVAL '1 year'
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. ENHANCED RLS POLICIES
-- ============================================

-- More restrictive RLS for journal entries
DROP POLICY IF EXISTS "Users can view their own journal entries" ON public.journal_entries;
CREATE POLICY "Users can view their own journal entries" 
  ON public.journal_entries FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own journal entries" ON public.journal_entries;
CREATE POLICY "Users can update their own journal entries" 
  ON public.journal_entries FOR UPDATE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own journal entries" ON public.journal_entries;
CREATE POLICY "Users can delete their own journal entries" 
  ON public.journal_entries FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================
-- 4. AUDIT LOGGING
-- ============================================

-- Create audit log table
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only users can see their own audit logs
CREATE POLICY "Users can view their own audit logs" 
  ON public.audit_log FOR SELECT 
  USING (auth.uid() = user_id);

-- ============================================
-- 5. PRIVACY SETTINGS TABLE
-- ============================================

-- Add privacy settings to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{
  "dataRetention": "indefinite",
  "dataSharing": false,
  "analytics": false,
  "contentWarnings": true,
  "accessibility": {
    "reducedMotion": false,
    "highContrast": false,
    "screenReader": false
  }
}';

-- ============================================
-- 6. ENCRYPTION FUNCTIONS
-- ============================================

-- Function to encrypt sensitive content
CREATE OR REPLACE FUNCTION encrypt_content(content TEXT, key TEXT DEFAULT 'space-whale-encryption-key')
RETURNS TEXT AS $$
BEGIN
  -- Use PostgreSQL's built-in encryption
  RETURN encode(pgp_sym_encrypt(content, key), 'base64');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrypt sensitive content
CREATE OR REPLACE FUNCTION decrypt_content(encrypted_content TEXT, key TEXT DEFAULT 'space-whale-encryption-key')
RETURNS TEXT AS $$
BEGIN
  -- Use PostgreSQL's built-in decryption
  RETURN pgp_sym_decrypt(decode(encrypted_content, 'base64'), key);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. DATA EXPORT FUNCTION
-- ============================================

-- Function for users to export their data
CREATE OR REPLACE FUNCTION export_user_data(user_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Only allow users to export their own data
  IF auth.uid() != user_uuid THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT jsonb_build_object(
    'profile', (SELECT to_jsonb(p.*) FROM public.profiles p WHERE p.id = user_uuid),
    'journal_entries', (SELECT jsonb_agg(to_jsonb(je.*)) FROM public.journal_entries je WHERE je.user_id = user_uuid),
    'posts', (SELECT jsonb_agg(to_jsonb(p.*)) FROM public.posts p WHERE p.user_id = user_uuid),
    'exported_at', NOW()
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. DATA DELETION FUNCTION
-- ============================================

-- Function for users to delete all their data
CREATE OR REPLACE FUNCTION delete_user_data(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Only allow users to delete their own data
  IF auth.uid() != user_uuid THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Delete all user data
  DELETE FROM public.journal_entries WHERE user_id = user_uuid;
  DELETE FROM public.posts WHERE user_id = user_uuid;
  DELETE FROM public.comments WHERE user_id = user_uuid;
  DELETE FROM public.likes WHERE user_id = user_uuid;
  DELETE FROM public.profiles WHERE id = user_uuid;
  DELETE FROM public.audit_log WHERE user_id = user_uuid;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;




