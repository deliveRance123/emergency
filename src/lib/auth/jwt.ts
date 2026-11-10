import { SignJWT, jwtVerify } from "jose";

const secretKey = process.env.JWT_SECRET || "emergency-connect-default-secret-key-min-32-chars-long";
const key = new TextEncoder().encode(secretKey);

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: "citizen" | "responder" | "admin";
  fullName: string;
  [key: string]: unknown;
}

export async function signAuthToken(payload: AuthTokenPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

export async function verifyAuthToken(token: string): Promise<AuthTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload as AuthTokenPayload;
  } catch {
    return null;
  }
}
