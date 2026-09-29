import { cookies } from "next/headers";
import { SESSION_COOKIE, MAX_AGE, createSessionToken, verifySessionToken } from "./session";
import { timingSafeEqual, createHash } from "node:crypto";

function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function checkCredentials(email: string, password: string): boolean {
  const e = process.env.ADMIN_EMAIL;
  const p = process.env.ADMIN_PASSWORD;
  if (!e || !p) {
    if (process.env.NODE_ENV === "production") return false;
    // Dev: credenciais padrão para facilitar testes locais
    return safeEqual(email.toLowerCase(), "admin@casamento.local") && safeEqual(password, "admin123");
  }
  const okEmail = safeEqual(email.trim().toLowerCase(), e.trim().toLowerCase());
  const okPass = safeEqual(password, p);
  return okEmail && okPass;
}

export async function setSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  return verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value);
}
