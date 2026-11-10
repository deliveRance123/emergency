import { cookies } from "next/headers";
import { signAuthToken, verifyAuthToken, AuthTokenPayload } from "./jwt";

export const SESSION_COOKIE_NAME = "emergency_session_token";

export async function getCurrentUser(): Promise<AuthTokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifyAuthToken(token);
}

export async function createSessionCookie(payload: AuthTokenPayload): Promise<void> {
  const token = await signAuthToken(payload);
  const cookieStore = await cookies();
  const isSecure =
    process.env.VERCEL === "1" ||
    process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://") === true;

  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
