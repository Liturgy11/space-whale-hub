-- Fix for journal_audit_trail foreign key constraint violation on DELETE
-- The issue: When deleting a journal entry, the AFTER DELETE trigger tries to insert
-- an audit trail record, but the foreign key constraint fails because the journal entry
-- is being deleted in the same transaction.
-- 
-- Solution: Use a BEFORE DELETE trigger for deletions, so we capture the info
-- before the row is deleted. This way, the foreign key reference is valid when
-- the audit record is inserted.

-- Step 1: Drop the existing trigger
DROP TRIGGER IF EXISTS journal_audit_trigger ON public.journal_entries;

-- Step 2: Create separate triggers for different operations
-- We'll use AFTER for INSERT/UPDATE and BEFORE for DELETE

-- First, create a trigger function for INSERT and UPDATE (AFTER)
CREATE OR REPLACE FUNCTION journal_audit_trigger_insert_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
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
  END IF;
  
  RETURN NULL;
END;
$$;

-- Create a trigger function for DELETE (BEFORE)
CREATE OR REPLACE FUNCTION journal_audit_trigger_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log deletion BEFORE the row is deleted
  -- This ensures the foreign key reference is still valid
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
END;
$$;

-- Step 3: Create the triggers
-- AFTER trigger for INSERT and UPDATE
CREATE TRIGGER journal_audit_trigger_insert_update
  AFTER INSERT OR UPDATE
  ON public.journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION journal_audit_trigger_insert_update();

-- BEFORE trigger for DELETE
CREATE TRIGGER journal_audit_trigger_delete
  BEFORE DELETE
  ON public.journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION journal_audit_trigger_delete();
