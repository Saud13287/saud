import { createHmac, randomBytes } from "crypto";

const SECRET = process.env.AUTH_SECRET || "saud-fin-secret-key-2026-v2";

export type UserRole = "admin" | "trader" | "viewer";

export interface TokenPayload {
  userId: number;
  email: string;
  role: UserRole;
  exp: number;
}

export function hashPassword(password: string): string {
  return createHmac("sha256", SECRET).update(password + "saud-salt-2026").digest("hex");
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export function generateToken(userId: number, email: string, role: UserRole = "trader"): string {
  const payload = JSON.stringify({ userId, email, role, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 });
  const signature = createHmac("sha256", SECRET).update(payload).digest("hex");
  return Buffer.from(JSON.stringify({ payload, signature })).toString("base64");
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const { payload, signature } = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
    const expectedSig = createHmac("sha256", SECRET).update(payload).digest("hex");
    if (signature !== expectedSig) return null;
    const data = JSON.parse(payload) as TokenPayload;
    if (data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

export function isAdmin(token: string): boolean {
  const payload = verifyToken(token);
  return payload?.role === "admin";
}

export const ADMIN_EMAIL = "admin@saud.ai";
