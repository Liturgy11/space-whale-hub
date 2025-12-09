-- Verification queries to check security enhancements were installed correctly

-- 1. Check if new tables were created
SELECT 'Tables Check' as check_type, tablename, 
       CASE WHEN tablename IN ('journal_access_logs', 'journal_audit_trail') 
            THEN '✅ Created' 
            ELSE '❌ Missing' 
       END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('journal_access_logs', 'journal_audit_trail');

-- 2. Check if new columns were added to journal_entries
SELECT 'Columns Check' as check_type, column_name, data_type,
       CASE WHEN column_name IN ('content_encrypted', 'is_encrypted', 'retention_policy', 'auto_delete_at', 'is_soft_deleted')
            THEN '✅ Added'
            ELSE '❌ Missing'
       END as status
FROM information_schema.columns 
WHERE table_name = 'journal_entries' 
AND column_name IN ('content_encrypted', 'is_encrypted', 'encryption_key_id', 'retention_policy', 'auto_delete_at', 'deleted_at', 'is_soft_deleted');

-- 3. Check if RLS is enabled
SELECT 'RLS Check' as check_type, tablename, rowsecurity as rls_enabled,
       CASE WHEN rowsecurity THEN '✅ Enabled' ELSE '❌ Disabled' END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('journal_entries', 'journal_access_logs', 'journal_audit_trail');

-- 4. Check if policies exist
SELECT 'Policies Check' as check_type, tablename, policyname, cmd as operation,
       '✅ Exists' as status
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'journal_entries'
ORDER BY policyname;

-- 5. Check if trigger exists (you already verified this!)
SELECT 'Trigger Check' as check_type, trigger_name, 
       string_agg(event_manipulation, ', ') as events,
       '✅ Active' as status
FROM information_schema.triggers
WHERE event_object_schema = 'public'
AND event_object_table = 'journal_entries'
GROUP BY trigger_name;

-- 6. Check if functions exist
SELECT 'Functions Check' as check_type, routine_name,
       '✅ Created' as status
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('log_journal_access', 'create_journal_audit_trail', 'cleanup_expired_journal_entries');

