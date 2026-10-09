export const LOGIN_RETURN_COOKIE = "lucidspace_login_next";
export const LOGIN_RETURN_PATH = "/auth/callback";
export const LOGIN_RETURN_MAX_AGE = 300;
export const DEFAULT_LOGIN_RETURN = "/projects/lotto";

export function safeLoginReturn(value: string | undefined): string {
  if (!value || value.length > 2048) return DEFAULT_LOGIN_RETURN;
  try {
    const decoded = decodeURIComponent(value);
    for (const candidate of [value, decoded]) {
      if (!candidate.startsWith("/") || candidate.startsWith("//") || /[\\\u0000-\u0020\u007f]/.test(candidate)) return DEFAULT_LOGIN_RETURN;
      const parsed = new URL(candidate, "https://login-return.invalid");
      if (parsed.origin !== "https://login-return.invalid" || parsed.pathname === LOGIN_RETURN_PATH) return DEFAULT_LOGIN_RETURN;
    }
    return value;
  } catch {
    return DEFAULT_LOGIN_RETURN;
  }
}

export function loginReturnCookie(path: string, secure: boolean): string {
  // Store only the destination pathname; never query parameters or auth material.
  return LOGIN_RETURN_COOKIE + "=" + encodeURIComponent(safeLoginReturn(path)) + "; Path=" + LOGIN_RETURN_PATH + "; Max-Age=" + LOGIN_RETURN_MAX_AGE + "; SameSite=Lax" + (secure ? "; Secure" : "");
}

export function readLoginReturnCookie(value: string | undefined): string {
  try {
    return safeLoginReturn(value ? decodeURIComponent(value) : undefined);
  } catch {
    return DEFAULT_LOGIN_RETURN;
  }
}
