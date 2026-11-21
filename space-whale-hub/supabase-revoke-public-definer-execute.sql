-- Soft-launch hardening: stop anon/authenticated from calling SECURITY DEFINER
-- helpers as public RPCs. Triggers and service_role API routes keep working.
-- Run in Supabase SQL Editor. Safe to re-run.

-- ---------------------------------------------------------------------------
-- Journal / audit / cleanup (should never be client RPCs)
-- ---------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.cleanup_expired_journal_entries() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cleanup_expired_journal_entries() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_journal_entries() TO service_role;

REVOKE ALL ON FUNCTION public.create_journal_audit_trail(uuid, uuid, text, jsonb, jsonb, text[], inet, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_journal_audit_trail(uuid, uuid, text, jsonb, jsonb, text[], inet, text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_journal_audit_trail(uuid, uuid, text, jsonb, jsonb, text[], inet, text) TO postgres, service_role;

REVOKE ALL ON FUNCTION public.log_journal_access(uuid, uuid, text, inet, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.log_journal_access(uuid, uuid, text, inet, text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.log_journal_access(uuid, uuid, text, inet, text) TO service_role;

-- Trigger functions (fire from table triggers; must not be callable via /rest/v1/rpc)
REVOKE ALL ON FUNCTION public.journal_audit_trigger() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.journal_audit_trigger() FROM anon, authenticated;

REVOKE ALL ON FUNCTION public.journal_audit_trigger_delete() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.journal_audit_trigger_delete() FROM anon, authenticated;

REVOKE ALL ON FUNCTION public.journal_audit_trigger_insert_update() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.journal_audit_trigger_insert_update() FROM anon, authenticated;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated;

-- ---------------------------------------------------------------------------
-- Community feed (app uses service_role in get-posts-secure)
-- ---------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.get_community_feed(uuid, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_community_feed(uuid, integer) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_community_feed(uuid, integer) TO service_role;

-- ---------------------------------------------------------------------------
-- Invite codes (API routes updated to use service_role)
-- ---------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.validate_invite_code(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.validate_invite_code(text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.validate_invite_code(text) TO service_role;

REVOKE ALL ON FUNCTION public.use_invite_code(text, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.use_invite_code(text, uuid) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.use_invite_code(text, uuid) TO service_role;
