-- DRAFT ONLY. Roll back before use; if records exist, stop and preserve them.
-- Restoring a used installation requires a separate reviewed export/restore plan.
BEGIN;
DO $rollback$
BEGIN
  IF to_regclass('public.study_notes') IS NULL THEN RETURN; END IF;
  IF EXISTS (SELECT 1 FROM public.study_notes LIMIT 1) THEN
    RAISE EXCEPTION 'study_notes contains records: rollback refused to prevent data loss';
  END IF;
  DROP TABLE public.study_notes; -- No CASCADE; only this new, empty table and its own policies/index are removed.
END $rollback$;
COMMIT;
