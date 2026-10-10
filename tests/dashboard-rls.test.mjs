import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {PGlite} from "@electric-sql/pglite";
const owner="11111111-1111-4111-8111-111111111111";
const other="22222222-2222-4222-8222-222222222222";
const foreign="33333333-3333-4333-8333-333333333333";
const forward=(await readFile(new URL("../supabase/study-notes.draft.sql",import.meta.url),"utf8")).replaceAll("__DASHBOARD_OWNER_UUID__",owner);
const rollback=await readFile(new URL("../supabase/study-notes-rollback.draft.sql",import.meta.url),"utf8");
test("draft SQL: owner CRUD, direct-DB isolation, session revocation and safe rollback on local Postgres", async () => {
  const db=new PGlite();
  try {
    await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
      CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY);
      INSERT INTO auth.users VALUES ('${owner}'),('${other}'),('${foreign}');
      CREATE TABLE public.lotto_preservation_fixture(value text); INSERT INTO public.lotto_preservation_fixture VALUES ('KEEP');
      CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.test_uid',true),'')::uuid $$;
      CREATE FUNCTION public.dashboard_session_active() RETURNS boolean LANGUAGE sql STABLE AS $$ SELECT current_setting('request.test_active',true)='true' $$;
      GRANT USAGE ON SCHEMA auth,public TO authenticated,anon;
      GRANT EXECUTE ON FUNCTION auth.uid(), public.dashboard_session_active() TO authenticated;`);
    await db.exec(forward);
    async function login(uuid,role="authenticated",active=true) {
      await db.exec(`RESET ROLE; SET ROLE ${role}; SELECT set_config('request.test_uid','${uuid}',false); SELECT set_config('request.test_active','${active}',false);`);
    }
    await login(owner);
    const row=(await db.query("INSERT INTO study_notes(title,body,category) VALUES ('TEST','## copied','학습') RETURNING *")).rows[0];
    assert.equal(row.user_id,owner);
    await db.query("UPDATE study_notes SET bookmarked=true, title='TEST edited' WHERE id=$1",[row.id]);
    assert.equal((await db.query("SELECT * FROM study_notes")).rows[0].bookmarked,true);
    await assert.rejects(db.query("UPDATE study_notes SET user_id=$1 WHERE id=$2",[other,row.id]),/permission denied/);
    await assert.rejects(db.query("INSERT INTO study_notes(user_id,title,body) VALUES ($1,'TEST forged','x')",[other]),/row-level security/);
    for(const uuid of [other,foreign]) {
      await login(uuid);
      assert.equal((await db.query("SELECT * FROM study_notes")).rows.length,0);
      assert.equal((await db.query("UPDATE study_notes SET body='attack' WHERE id=$1 RETURNING id",[row.id])).rows.length,0);
      assert.equal((await db.query("DELETE FROM study_notes WHERE id=$1 RETURNING id",[row.id])).rows.length,0);
      await assert.rejects(db.query("INSERT INTO study_notes(title,body) VALUES ('TEST blocked','x')"),/row-level security/);
    }
    await login(owner,"authenticated",false);
    assert.equal((await db.query("SELECT * FROM study_notes")).rows.length,0);
    assert.equal((await db.query("DELETE FROM study_notes RETURNING id")).rows.length,0);
    await assert.rejects(db.query("INSERT INTO study_notes(title,body) VALUES ('TEST expired','x')"),/row-level security/);
    await login("","anon");
    await assert.rejects(db.query("SELECT * FROM study_notes"),/permission denied/);
    await db.exec("RESET ROLE");
    await assert.rejects(db.exec(rollback),/rollback refused/);
    await db.exec("ROLLBACK");
    assert.equal((await db.query("SELECT body FROM study_notes")).rows[0].body,"## copied");
    await login(owner);
    await db.query("DELETE FROM study_notes WHERE id=$1",[row.id]);
    await db.exec("RESET ROLE");
    await db.exec(rollback);
    assert.equal((await db.query("SELECT to_regclass('public.study_notes') AS relation")).rows[0].relation,null);
    assert.equal((await db.query("SELECT count(*)::int AS count FROM auth.users")).rows[0].count,3);
    assert.equal((await db.query("SELECT value FROM lotto_preservation_fixture")).rows[0].value,"KEEP");
  } finally {await db.close();}
});
