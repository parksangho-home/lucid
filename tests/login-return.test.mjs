import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import ts from "typescript";
import { safeLoginReturn, loginReturnCookie, readLoginReturnCookie } from "../lib/supabase/login-return.ts";

const fallback = "/projects/lotto";
test("login return accepts home and Lotto, rejects external and encoded unsafe paths", () => {
  for (const value of ["/", "/projects/lotto", "/dashboard"]) assert.equal(safeLoginReturn(value), value);
  for (const value of [undefined, "", "https://outside.invalid", "//outside.invalid", "/\\outside.invalid", "/%2foutside.invalid", "/%5coutside.invalid", "/%0a/outside.invalid", "/%", "/auth/callback", "/a/../auth/callback"]) assert.equal(safeLoginReturn(value), fallback, String(value));
});
test("return cookie has five minute lifetime, callback scope and HTTPS security", () => {
  const local = loginReturnCookie("/", false);
  assert.equal(readLoginReturnCookie(local.split(";")[0].split("=")[1]), "/");
  assert.match(local, /Max-Age=300/);
  assert.match(local, /Path=\/auth\/callback/);
  assert.match(local, /SameSite=Lax/);
  assert.doesNotMatch(local, /Secure|Domain=/);
  assert.match(loginReturnCookie("/projects/lotto", true), /; Secure$/);
  assert.equal(readLoginReturnCookie("%"), fallback);
});

async function callback(cookie, exchange = "success") {
  const req = createRequire(import.meta.url);
  const dataModule = code => "data:text/javascript;base64," + Buffer.from(code).toString("base64");
  let source = fs.readFileSync(new URL("../app/auth/callback/route.ts", import.meta.url), "utf8");
  source = source.replace('"next/server"', JSON.stringify(pathToFileURL(req.resolve("next/server")).href))
    .replace('"next/headers"', JSON.stringify(dataModule('export async function cookies(){return {get:()=>('+JSON.stringify(cookie===undefined?undefined:{value:cookie})+')}}')))
    .replace('"@/lib/supabase/server"', JSON.stringify(dataModule('export async function createClient(){return {auth:{exchangeCodeForSession:async()=>{'+(exchange==='throw'?'throw Error("unavailable")':'return {error:'+(exchange==='success'?'null':'{}')+'}')+'}}}}')))
    .replace('"@/lib/supabase/login-return"', JSON.stringify(new URL("../lib/supabase/login-return.ts", import.meta.url).href));
  return (await import(dataModule(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText))).GET;
}
test("actual callback returns home/Lotto or fallback on same origin and clears cookie", async () => {
  for (const [cookie,expected] of [[encodeURIComponent("/"),"/"],[encodeURIComponent(fallback),fallback],[undefined,fallback],[encodeURIComponent("//outside.invalid"),fallback],[encodeURIComponent("/%2foutside.invalid"),fallback]]) {
    const get = await callback(cookie);
    for (const origin of ["http://localhost:3000","https://www.lucidspace.kr"]) {
      const response = await get(new Request(origin+"/auth/callback?code=fixed-test-code&next=https://outside.invalid"));
      assert.equal(response.headers.get("location"), origin+expected);
      assert.match(response.headers.get("set-cookie"), /Max-Age=0/);
      assert.match(response.headers.get("set-cookie"), /Path=\/auth\/callback/);
      assert.equal(response.headers.get("cache-control"), "private, no-store");
    }
  }
});
test("callback missing code, exchange error and outage keep existing auth-error route and clear cookie", async () => {
  for (const [exchange,query] of [["success",""],["error","?code=fixed-test-code"],["throw","?code=fixed-test-code"]]) {
    const get = await callback(encodeURIComponent("/"),exchange);
    const response = await get(new Request("http://localhost:3000/auth/callback"+query));
    assert.equal(response.headers.get("location"),"http://localhost:3000/projects/lotto?authError=1");
    assert.match(response.headers.get("set-cookie"), /Max-Age=0/);
  }
});
