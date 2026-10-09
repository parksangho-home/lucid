import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { LOGIN_RETURN_COOKIE, LOGIN_RETURN_PATH, readLoginReturnCookie } from "@/lib/supabase/login-return";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = readLoginReturnCookie((await cookies()).get(LOGIN_RETURN_COOKIE)?.value);
  const redirect = (path: string) => {
    const response = NextResponse.redirect(new URL(path, url.origin));
    response.headers.set("Cache-Control", "private, no-store");
    response.cookies.set(LOGIN_RETURN_COOKIE, "", {
      path: LOGIN_RETURN_PATH, maxAge: 0, expires: new Date(0),
      sameSite: "lax", secure: url.protocol === "https:",
    });
    return response;
  };

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return redirect(next);
    } catch {
      // Keep credentials and upstream errors out of logs and redirects.
    }
  }
  return redirect("/projects/lotto?authError=1");
}
