import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DashboardError, noteInput, searchPattern, safeMarkdownUrl } from "../lib/dashboard/domain.ts";
import { verifyDashboardOwner } from "../lib/dashboard/auth-policy.ts";
import { dashboardMode, dashboardRewrites } from "../lib/dashboard/routing.ts";
import { getNote, listNotes, createNote, updateNote, deleteNote } from "../lib/dashboard/notes.ts";
import { requireMutation, readNoteJson } from "../lib/dashboard/http.ts";
const owner = "11111111-1111-4111-8111-111111111111";
const other = "22222222-2222-4222-8222-222222222222";
const sid = "33333333-3333-4333-8333-333333333333";
const noteId = "44444444-4444-4444-8444-444444444444";
const issuer = "https://gcjjktxhypwjnnwkpaxt.supabase.co/auth/v1";
function goodAuth(overrides = {}) {
  const claims = {sub: owner, session_id: sid, iss: issuer, aud: "authenticated", role: "authenticated", exp: Date.now()/1000+600, ...overrides};
  return {getClaims: async () => ({data: {claims}, error: null}),
    getUser: async () => ({data: {user: {id: claims.sub, email_confirmed_at: "2026-01-01", identities: [{provider: "google"}]}}, error: null})};
}
test("server authorization accepts only verified owner Google UUID", async () => {
  assert.equal((await verifyDashboardOwner(goodAuth(), owner)).id, owner);
  await assert.rejects(verifyDashboardOwner(goodAuth({sub: other}), owner), e => e.status === 403);
  await assert.rejects(verifyDashboardOwner(goodAuth(), undefined), e => e.status === 503);
  const auth = goodAuth(); auth.getUser = async () => ({data: {user: {id: owner, identities: [{provider: "email"}]}}, error: null});
  await assert.rejects(verifyDashboardOwner(auth, owner), e => e.status === 403);
});
test("expired/wrong issuer/role/session/sub and anonymous claims fail closed", async () => {
  for (const change of [{exp: 0}, {iss: "https://untrusted.test/auth/v1"}, {role: "service_role"}, {aud: "anon"}, {session_id: "bad"}, {sub: "bad"}])
    await assert.rejects(verifyDashboardOwner(goodAuth(change), owner), e => e.status === 401);
  const auth = goodAuth(); auth.getClaims = async () => ({data: null, error: null});
  await assert.rejects(verifyDashboardOwner(auth, owner), e => e.status === 401);
});
test("auth outages and mismatched getUser never authorize", async () => {
  const auth = goodAuth(); auth.getUser = async () => ({data: {user: null}, error: {status: 503}});
  await assert.rejects(verifyDashboardOwner(auth, owner), e => e.status === 503);
  auth.getUser = async () => ({data: {user: {id: other}}, error: null});
  await assert.rejects(verifyDashboardOwner(auth, owner), e => e.status === 401);
});
test("notes accept copied Markdown without permitting user/id injection", () => {
  const input = {title: " TEST ", body: "\n# 설명\n\n복사한 답변\n", category: " 학습 ", bookmarked: true};
  assert.equal(noteInput(input).body, input.body);
  assert.equal(noteInput(input).title, "TEST");
  for (const bad of [{...input, user_id: other}, {id: noteId}, {body: " "}, {...input, bookmarked: "true"}, {...input, title: "a".repeat(201)}])
    assert.throws(() => noteInput(bad), DashboardError);
  assert.deepEqual(noteInput({bookmarked: false}, true), {bookmarked: false});
  assert.throws(() => noteInput({}, true));
  for(const bad of [{body:null},{bookmarked:null},{category:null}]) assert.throws(() => noteInput(bad,true));
  assert.equal(searchPattern('%_\\a"),id.eq.x'), JSON.stringify('%\\%\\_\\\\a"),id.eq.x%'));
  assert.throws(() => searchPattern("x".repeat(201)));
});
test("development internal routing and production legacy routing coexist", () => {
  assert.equal(dashboardMode({NODE_ENV: "development"}), "internal");
  assert.deepEqual(dashboardRewrites({NODE_ENV: "development"}), []);
  const legacy = dashboardRewrites({NODE_ENV: "production", DASHBOARD_UPSTREAM_ORIGIN: "https://old.example"});
  assert.equal(legacy[0].destination, "https://old.example/dashboard");
  assert.equal(dashboardMode({NODE_ENV: "production", DASHBOARD_ROUTING_MODE: "internal"}), "internal");
  assert.deepEqual(dashboardRewrites({NODE_ENV: "production", DASHBOARD_ROUTING_MODE: "internal", DASHBOARD_UPSTREAM_ORIGIN: "https://old.example"}), []);
  assert.throws(() => dashboardRewrites({NODE_ENV: "production", DASHBOARD_UPSTREAM_ORIGIN: "http://old.example"}));
});
function mockContext({data = null, error = null} = {}) {
  const calls = [];
  const chain = {};
  for (const name of ["select", "eq", "insert", "update", "delete", "or", "order", "range"])
    chain[name] = (...args) => {calls.push([name, ...args]); return chain;};
  chain.then = resolve => resolve({data, error, count: Array.isArray(data) ? data.length : 0});
  chain.single = chain.maybeSingle = async () => ({data, error});
  return {context: {userId: owner, client: {from: name => {calls.push(["from", name]); return chain;}}}, calls};
}
test("every note query/mutation filters by verified owner; create sets its owner", async () => {
  for (const operation of [(c) => getNote(c,noteId), (c) => listNotes(c,new URLSearchParams("q=test&category=학습&bookmarked=true")), (c) => updateNote(c,noteId,{bookmarked:true}), (c) => deleteNote(c,noteId)]) {
    const {context,calls} = mockContext({data: {id:noteId}});
    await operation(context);
    assert.ok(calls.some(c => c[0] === "eq" && c[1] === "user_id" && c[2] === owner));
  }
  const {context,calls} = mockContext({data:{id:noteId}});
  await createNote(context,{title:"TEST",body:"copied",category:"학습",bookmarked:false});
  assert.equal(calls.find(c => c[0] === "insert")[1].user_id,owner);
  const missing = mockContext({error:{code:"42P01"}});
  await assert.rejects(listNotes(missing.context,new URLSearchParams()),e => e.status===503 && e.code==="database_setup_required");
  await assert.rejects(getNote(mockContext().context,noteId),e => e.status===404);
});
test("mutation rejects cross-origin/missing origin and invalid/oversized JSON", async () => {
  for (const headers of [{}, {origin:"https://evil.example","content-type":"application/json"}])
    assert.throws(() => requireMutation(new Request("http://localhost:3000/api/dashboard/notes",{method:"POST",headers})), e => e.status===403);
  const headers={origin:"http://localhost:3000","content-type":"application/json"};
  requireMutation(new Request("http://localhost:3000/api/dashboard/notes",{method:"POST",headers}));
  requireMutation(new Request("http://localhost:3000/api/dashboard/notes",{method:"POST",headers:{...headers,origin:"http://127.0.0.1:3000",host:"127.0.0.1:3000"}}));
  assert.throws(() => requireMutation(new Request("http://localhost:3000/api/dashboard/notes",{method:"POST",headers:{...headers,origin:"https://evil.example",host:"localhost:3000","x-forwarded-host":"evil.example"}})),e => e.status===403);
  await assert.rejects(readNoteJson(new Request("http://localhost:3000",{method:"POST",body:"bad"})), e => e.status===400);
  await assert.rejects(readNoteJson(new Request("http://localhost:3000",{method:"POST",body:"x".repeat(512*1024+1)})), e => e.status===413);
});
const require = createRequire(import.meta.url);
async function loadTransformed(relative, changes = {}) {
  const url = new URL(relative,import.meta.url);
  let source = await readFile(url,"utf8");
  for (const [from,to] of Object.entries(changes)) source=source.replaceAll(from,to);
  let output = ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
  output=output.replace(/from (["'])([^"']+)\1/g, (_whole,_quote,specifier) => {
    const resolved=specifier.startsWith("data:") ? specifier : specifier.startsWith(".") ? new URL(specifier,url).href : pathToFileURL(require.resolve(specifier)).href;
    return "from "+JSON.stringify(resolved);
  });
  return import("data:text/javascript;base64,"+Buffer.from(output).toString("base64"));
}
test("actual Markdown renderer preserves tables/code and blocks HTML, script URLs and image fetching", async () => {
  const {NoteMarkdown}=await loadTransformed("../components/dashboard/markdown.tsx");
  const html=renderToStaticMarkup(React.createElement(NoteMarkdown,{body:'# TEST\n\n<script>alert(1)</script>\n\n[bad](javascript:alert%281%29) [ok](https://example.com)\n\n![tracking](https://evil.example/pixel)\n\n| A | B |\n| - | - |\n| 1 | 2 |\n\n~~~js\n<script>text</script>\n~~~'}));
  assert.ok(html.includes("<table>")); assert.ok(html.includes("<pre>"));
  assert.ok(html.includes('rel="noopener noreferrer"'));
  assert.ok(!html.includes("<script>")); assert.ok(!html.includes('href="javascript:')); assert.ok(!html.includes("<img"));
  for(const url of ["javascript:alert(1)","data:text/html,a","//evil.example","/\\evil.example"])
    assert.equal(safeMarkdownUrl(url),"");
});
test("actual API routes enforce session, recheck before save, isolate ids and reject missing DB", async () => {
  const originalMode=process.env.DASHBOARD_ROUTING_MODE, originalOwner=process.env.DASHBOARD_OWNER_UUID;
  process.env.DASHBOARD_ROUTING_MODE="internal"; process.env.DASHBOARD_OWNER_UUID=owner;
  const mocked = mockContext({data:{id:noteId,title:"TEST"}});
  let active=true; let calls=0;
  globalThis.__dashboardTestClient={...mocked.context.client,auth:goodAuth(),rpc:() => ({abortSignal:async () => {calls++; return {data:active,error:null};}})};
  const stub="data:text/javascript;base64,"+Buffer.from("export async function createClient(){return globalThis.__dashboardTestClient;}").toString("base64");
  try {
    const auth=await loadTransformed("../lib/dashboard/auth.ts",{'"../supabase/server.ts"':JSON.stringify(stub)});
    // Share one real auth module between every endpoint.
    const authUrl="data:text/javascript;base64,"+Buffer.from('export const requireDashboardOwner=globalThis.__dashboardTestGuard;').toString("base64");
    globalThis.__dashboardTestGuard=auth.requireDashboardOwner;
    const collection=await loadTransformed("../app/api/dashboard/notes/route.ts",{'"../../../../lib/dashboard/auth.ts"':JSON.stringify(authUrl)});
    const item=await loadTransformed("../app/api/dashboard/notes/[id]/route.ts",{'"../../../../../lib/dashboard/auth.ts"':JSON.stringify(authUrl)});
    const headers={origin:"http://localhost:3000","content-type":"application/json","x-dashboard-user":owner};
    const req=(method,body,overrides={})=>new Request("http://localhost:3000/api/dashboard/notes/"+noteId,{method,headers:{...headers,...overrides},...(body===undefined?{}:{body:JSON.stringify(body)})});
    const ctx={params:Promise.resolve({id:noteId})};
    active=false;
    for (const [handler,method,body] of [[collection.GET,"GET"],[collection.POST,"POST",{title:"TEST",body:"x"}],[item.GET,"GET"],[item.PATCH,"PATCH",{bookmarked:true}],[item.DELETE,"DELETE"]]) {
      const response=await handler(req(method,body),ctx);
      assert.equal(response.status,401); assert.equal(response.headers.get("Cache-Control"),"private, no-store");
    }
    assert.equal(mocked.calls.length,0);
    active=true; calls=0;
    const created=await collection.POST(req("POST",{title:"TEST",body:"copied"}));
    assert.equal(created.status,201); assert.equal(calls,2);
    const stale=await item.PATCH(req("PATCH",{bookmarked:true},{"x-dashboard-user":other}),ctx);
    assert.equal(stale.status,401);
    const injected=await collection.POST(req("POST",{title:"TEST",body:"copied",user_id:other}));
    assert.equal(injected.status,400);
    assert.equal((await item.GET(req("GET"),{params:Promise.resolve({id:"bad"})})).status,404);
    globalThis.__dashboardTestClient.from=mockContext({error:{code:"42P01"}}).context.client.from;
    assert.equal((await collection.GET(req("GET"))).status,503);
    globalThis.__dashboardTestClient.from=mockContext().context.client.from;
    assert.equal((await item.GET(req("GET"),ctx)).status,404);
    globalThis.__dashboardTestClient.rpc=()=>({abortSignal:async()=>({data:null,error:{message:"outage"}})});
    assert.equal((await item.GET(req("GET"),ctx)).status,503);
    globalThis.__dashboardTestClient.auth=goodAuth({sub:other});
    const deniedDb=mockContext();
    globalThis.__dashboardTestClient.from=deniedDb.context.client.from;
    globalThis.__dashboardTestClient.rpc=()=>({abortSignal:async()=>({data:true,error:null})});
    for (const [handler,method,body] of [[collection.GET,"GET"],[collection.POST,"POST",{title:"TEST",body:"x"}],[item.GET,"GET"],[item.PATCH,"PATCH",{bookmarked:true}],[item.DELETE,"DELETE"]]) {
      assert.equal((await handler(req(method,body),ctx)).status,403);
    }
    assert.equal(deniedDb.calls.length,0);
    globalThis.__dashboardTestClient.auth={...goodAuth(),getClaims:async()=>({data:null,error:null})};
    assert.equal((await collection.GET(req("GET"))).status,401);
  } finally {
    if(originalMode===undefined)delete process.env.DASHBOARD_ROUTING_MODE;else process.env.DASHBOARD_ROUTING_MODE=originalMode;
    if(originalOwner===undefined)delete process.env.DASHBOARD_OWNER_UUID;else process.env.DASHBOARD_OWNER_UUID=originalOwner;
    delete globalThis.__dashboardTestClient; delete globalThis.__dashboardTestGuard;
  }
});
