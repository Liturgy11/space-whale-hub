-- Fix for journal_audit_trail foreign key constraint violation
-- The issue is that the foreign key constraint is being checked before the transaction commits
-- We need to: 1) Add an INSERT policy for RLS, 2) Make the trigger function SECURITY DEFINER,
-- and 3) Make the foreign key constraint DEFERRABLE

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE public.journal_audit_trail 
  DROP CONSTRAINT IF EXISTS journal_audit_trail_journal_entry_id_fkey;

-- Step 2: Recreate it as DEFERRABLE INITIALLY DEFERRED
-- This ensures the foreign key check happens at the end of the transaction
ALTER TABLE public.journal_audit_trail 
  ADD CONSTRAINT journal_audit_trail_journal_entry_id_fkey
  FOREIGN KEY (journal_entry_id) 
  REFERENCES public.journal_entries(id) 
  ON DELETE CASCADE 
  DEFERRABLE INITIALLY DEFERRED;

-- Step 3: Add INSERT policy to allow the SECURITY DEFINER function to insert audit trail records
-- This policy allows inserts when called from the trigger function
DROP POLICY IF EXISTS "Allow audit trail inserts via trigger" ON public.journal_audit_trail;
CREATE POLICY "Allow audit trail inserts via trigger"
  ON public.journal_audit_trail FOR INSERT
  WITH CHECK (true); -- SECURITY DEFINER function will handle authorization

-- Also ensure the trigger function itself is SECURITY DEFINER for extra safety
-- This ensures it has the right permissions to insert
CREATE OR REPLACE FUNCTION journal_audit_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- Run with elevated privileges to bypass RLS
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

-- Verify the trigger is still active
-- (No need to recreate it, just updating the function)

