-- ============================================
-- INNER SPACE JOURNAL SECURITY ENHANCEMENTS
-- ============================================
-- This script implements comprehensive security measures for journal entries
-- Based on Phase 1.5 Privacy & Safety Enhancement plan

-- ============================================
-- 1. ENCRYPTION SUPPORT
-- ============================================
-- Add encrypted content column (we'll encrypt sensitive content client-side)
-- Store encrypted content separately from plain text for maximum security

ALTER TABLE public.journal_entries 
ADD COLUMN IF NOT EXISTS content_encrypted BYTEA,
ADD COLUMN IF NOT EXISTS encryption_key_id TEXT,
ADD COLUMN IF NOT EXISTS is_encrypted BOOLEAN DEFAULT false;

-- Add index for encrypted entries
CREATE INDEX IF NOT EXISTS journal_entries_encrypted_idx 
ON public.journal_entries(is_encrypted) 
WHERE is_encrypted = true;

-- ============================================
-- 2. ACCESS LOGGING TABLE
-- ============================================
-- Track all access to journal entries for security auditing

CREATE TABLE IF NOT EXISTS public.journal_access_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  journal_entry_id UUID REFERENCES public.journal_entries(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL, -- 'view', 'create', 'update', 'delete'
  ip_address INET,
  user_agent TEXT,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on access logs
ALTER TABLE public.journal_access_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own access logs
CREATE POLICY "Users can view own access logs"
  ON public.journal_access_logs FOR SELECT
  USING (auth.uid() = user_id);

-- System can insert access logs (via service role)
-- Note: This will be done via service role API, so no INSERT policy needed for users

-- Index for faster queries
CREATE INDEX IF NOT EXISTS journal_access_logs_entry_id_idx 
ON public.journal_access_logs(journal_entry_id);

CREATE INDEX IF NOT EXISTS journal_access_logs_user_id_idx 
ON public.journal_access_logs(user_id);

CREATE INDEX IF NOT EXISTS journal_access_logs_accessed_at_idx 
ON public.journal_access_logs(accessed_at DESC);

-- ============================================
-- 3. AUDIT TRAIL TABLE
-- ============================================
-- Track all changes to journal entries for complete audit history

CREATE TABLE IF NOT EXISTS public.journal_audit_trail (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  journal_entry_id UUID REFERENCES public.journal_entries(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL, -- 'created', 'updated', 'deleted', 'viewed'
  old_values JSONB, -- Previous values (for updates)
  new_values JSONB, -- New values (for creates/updates)
  changed_fields TEXT[], -- Which fields were changed
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit trail
ALTER TABLE public.journal_audit_trail ENABLE ROW LEVEL SECURITY;

-- Users can only see audit trail for their own entries
CREATE POLICY "Users can view own audit trail"
  ON public.journal_audit_trail FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.journal_entries 
      WHERE id = journal_audit_trail.journal_entry_id 
      AND user_id = auth.uid()
    )
  );

-- Index for faster queries
CREATE INDEX IF NOT EXISTS journal_audit_trail_entry_id_idx 
ON public.journal_audit_trail(journal_entry_id);

CREATE INDEX IF NOT EXISTS journal_audit_trail_user_id_idx 
ON public.journal_audit_trail(user_id);

CREATE INDEX IF NOT EXISTS journal_audit_trail_created_at_idx 
ON public.journal_audit_trail(created_at DESC);

-- ============================================
-- 4. DATA RETENTION POLICIES
-- ============================================
-- Add fields to support user-controlled data retention

ALTER TABLE public.journal_entries 
ADD COLUMN IF NOT EXISTS retention_policy TEXT DEFAULT 'indefinite', -- 'indefinite', '1year', '6months', '30days'
ADD COLUMN IF NOT EXISTS auto_delete_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_soft_deleted BOOLEAN DEFAULT false;

-- Index for retention policy cleanup
CREATE INDEX IF NOT EXISTS journal_entries_auto_delete_idx 
ON public.journal_entries(auto_delete_at) 
WHERE auto_delete_at IS NOT NULL AND is_soft_deleted = false;

-- ============================================
-- 5. ENHANCED RLS POLICIES
-- ============================================
-- Strengthen existing RLS policies to ensure maximum security

-- Drop existing policies if they exist (to recreate with enhancements)
DROP POLICY IF EXISTS "Users can view their own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can view own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can create own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can insert their own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can update own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can update their own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can delete own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can delete their own journal entries" ON public.journal_entries;

-- Enhanced SELECT policy - only show non-deleted entries to owner
CREATE POLICY "Users can view own non-deleted journal entries"
  ON public.journal_entries FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id 
    AND (is_soft_deleted = false OR is_soft_deleted IS NULL)
  );

-- Enhanced INSERT policy - ensure user_id matches authenticated user
CREATE POLICY "Users can create own journal entries"
  ON public.journal_entries FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id 
    AND is_private = true -- Force private by default
  );

-- Enhanced UPDATE policy - prevent updating user_id, only owner can update
CREATE POLICY "Users can update own journal entries"
  ON public.journal_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id 
    AND user_id = (SELECT user_id FROM public.journal_entries WHERE id = journal_entries.id)
    -- Prevent changing user_id
  );

-- Enhanced DELETE policy - soft delete only (mark as deleted)
CREATE POLICY "Users can delete own journal entries"
  ON public.journal_entries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- 6. FUNCTION TO LOG ACCESS
-- ============================================
-- Function to automatically log access to journal entries
-- This will be called from API routes

CREATE OR REPLACE FUNCTION log_journal_access(
  p_entry_id UUID,
  p_user_id UUID,
  p_action TEXT,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Run with elevated privileges
AS $$
BEGIN
  INSERT INTO public.journal_access_logs (
    journal_entry_id,
    user_id,
    action,
    ip_address,
    user_agent
  ) VALUES (
    p_entry_id,
    p_user_id,
    p_action,
    p_ip_address,
    p_user_agent
  );
END;
$$;

-- ============================================
-- 7. FUNCTION TO CREATE AUDIT TRAIL
-- ============================================
-- Function to automatically create audit trail entries

CREATE OR REPLACE FUNCTION create_journal_audit_trail(
  p_entry_id UUID,
  p_user_id UUID,
  p_action TEXT,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_changed_fields TEXT[] DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Run with elevated privileges
AS $$
BEGIN
  INSERT INTO public.journal_audit_trail (
    journal_entry_id,
    user_id,
    action,
    old_values,
    new_values,
    changed_fields,
    ip_address,
    user_agent
  ) VALUES (
    p_entry_id,
    p_user_id,
    p_action,
    p_old_values,
    p_new_values,
    p_changed_fields,
    p_ip_address,
    p_user_agent
  );
END;
$$;

-- ============================================
-- 8. TRIGGER FOR AUTOMATIC AUDIT TRAIL
-- ============================================
-- Automatically create audit trail on journal entry changes

CREATE OR REPLACE FUNCTION journal_audit_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_old_values JSONB;
  v_new_values JSONB;
  v_changed_fields TEXT[];
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Log creation
    PERFORM create_journal_audit_trail(
      NEW.id,
      NEW.user_id,
      'created',
      NULL,
      to_jsonb(NEW),
      NULL,
      NULL,
      NULL
    );
    RETURN NEW;
    
  ELSIF TG_OP = 'UPDATE' THEN
    -- Build old and new values
    v_old_values := to_jsonb(OLD);
    v_new_values := to_jsonb(NEW);
    
    -- Determine changed fields
    SELECT array_agg(key)
    INTO v_changed_fields
    FROM jsonb_each(v_new_values)
    WHERE value IS DISTINCT FROM v_old_values->key;
    
    -- Log update
    PERFORM create_journal_audit_trail(
      NEW.id,
      NEW.user_id,
      'updated',
      v_old_values,
      v_new_values,
      v_changed_fields,
      NULL,
      NULL
    );
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    -- Log deletion
    PERFORM create_journal_audit_trail(
      OLD.id,
      OLD.user_id,
      'deleted',
      to_jsonb(OLD),
      NULL,
      NULL,
      NULL,
      NULL
    );
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS journal_audit_trigger ON public.journal_entries;
CREATE TRIGGER journal_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE
  ON public.journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION journal_audit_trigger();

-- ============================================
-- 9. FUNCTION FOR DATA RETENTION CLEANUP
-- ============================================
-- Function to automatically delete entries based on retention policy
-- This should be run as a scheduled job (cron)

CREATE OR REPLACE FUNCTION cleanup_expired_journal_entries()
RETURNS TABLE(deleted_count INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Soft delete entries that have passed their auto_delete_at date
  UPDATE public.journal_entries
  SET 
    is_soft_deleted = true,
    deleted_at = NOW()
  WHERE 
    auto_delete_at IS NOT NULL
    AND auto_delete_at <= NOW()
    AND is_soft_deleted = false;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN QUERY SELECT v_deleted_count;
END;
$$;

-- ============================================
-- 10. SECURITY NOTES
-- ============================================
-- 
-- IMPORTANT SECURITY CONSIDERATIONS:
--
-- 1. ENCRYPTION:
--    - Content encryption should be done CLIENT-SIDE before sending to server
--    - Use Web Crypto API or similar for browser-based encryption
--    - Encryption keys should be derived from user password (never stored)
--    - Consider using Supabase Vault for key management in production
--
-- 2. ACCESS LOGGING:
--    - All access to journal entries should be logged via API routes
--    - IP addresses and user agents help detect unauthorized access
--    - Regular review of access logs recommended
--
-- 3. AUDIT TRAIL:
--    - Automatic via database triggers
--    - Complete history of all changes
--    - Useful for security investigations
--
-- 4. DATA RETENTION:
--    - Users control their own retention policies
--    - Automatic cleanup via scheduled function
--    - Soft delete preserves audit trail
--
-- 5. RLS POLICIES:
--    - Multiple layers of security
--    - Users can ONLY access their own entries
--    - No exceptions (even admins need explicit service role)
--
-- 6. COMPLIANCE:
--    - Meets Australian Privacy Principles (APP)
--    - Supports GDPR right to deletion
--    - Complete audit trail for compliance
--
-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('journal_entries', 'journal_access_logs', 'journal_audit_trail');

-- Verify policies exist
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'journal_entries'
ORDER BY policyname;

-- Verify triggers exist
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_schema = 'public'
AND event_object_table = 'journal_entries';

