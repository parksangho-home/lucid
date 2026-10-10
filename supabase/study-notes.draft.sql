-- DRAFT ONLY. Replace __DASHBOARD_OWNER_UUID__ with the server-verified Google UUID.
-- Apply only after separate approval. No existing tables, records, auth settings or functions are modified.
BEGIN;
DO $preflight$
DECLARE owner_id uuid := '__DASHBOARD_OWNER_UUID__'::uuid;
BEGIN
  IF to_regclass('public.study_notes') IS NOT NULL THEN
    RAISE EXCEPTION 'study_notes already exists: stop and review instead of overwriting';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = owner_id) THEN
    RAISE EXCEPTION 'Verified owner must already exist in LucidSpace auth.users';
  END IF;
  IF to_regprocedure('public.dashboard_session_active()') IS NULL THEN
    RAISE EXCEPTION 'Previously reviewed active-session function is required';
  END IF;
END $preflight$;

CREATE TABLE public.study_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE RESTRICT,
  title text NOT NULL CHECK (char_length(title) <= 200 AND char_length(btrim(title)) >= 1),
  body text NOT NULL CHECK (char_length(body) <= 100000 AND char_length(btrim(body)) >= 1),
  category text NOT NULL DEFAULT '기타' CHECK (char_length(category) <= 80 AND char_length(btrim(category)) >= 1),
  bookmarked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX study_notes_user_updated_idx ON public.study_notes(user_id, updated_at DESC);
ALTER TABLE public.study_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_notes FORCE ROW LEVEL SECURITY;
-- Do not rely on inherited public-schema defaults or service-role writes.
REVOKE ALL ON public.study_notes FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT, INSERT, DELETE ON public.study_notes TO authenticated;
GRANT UPDATE (title, body, category, bookmarked, updated_at) ON public.study_notes TO authenticated;

CREATE POLICY study_notes_select ON public.study_notes FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = '__DASHBOARD_OWNER_UUID__'::uuid AND user_id = (SELECT auth.uid()) AND (SELECT public.dashboard_session_active()));
CREATE POLICY study_notes_insert ON public.study_notes FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = '__DASHBOARD_OWNER_UUID__'::uuid AND user_id = (SELECT auth.uid()) AND (SELECT public.dashboard_session_active()));
CREATE POLICY study_notes_update ON public.study_notes FOR UPDATE TO authenticated
USING ((SELECT auth.uid()) = '__DASHBOARD_OWNER_UUID__'::uuid AND user_id = (SELECT auth.uid()) AND (SELECT public.dashboard_session_active()))
WITH CHECK ((SELECT auth.uid()) = '__DASHBOARD_OWNER_UUID__'::uuid AND user_id = (SELECT auth.uid()) AND (SELECT public.dashboard_session_active()));
CREATE POLICY study_notes_delete ON public.study_notes FOR DELETE TO authenticated
USING ((SELECT auth.uid()) = '__DASHBOARD_OWNER_UUID__'::uuid AND user_id = (SELECT auth.uid()) AND (SELECT public.dashboard_session_active()));
COMMIT;
