import { createHmac, randomBytes } from "crypto";

const SECRET = process.env.AUTH_SECRET || "saud-fin-secret-key-2026";

export function hashPassword(password: string): string {
  return createHmac("sha256", SECRET).update(password).digest("hex");
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export function generateToken(userId: number, email: string): string {
  const payload = JSON.stringify({ userId, email, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 });
  const signature = createHmac("sha256", SECRET).update(payload).digest("hex");
  return Buffer.from(JSON.stringify({ payload, signature })).toString("base64");
}

export function verifyToken(token: string): { userId: number; email: string } | null {
  try {
    const { payload, signature } = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
    const expectedSig = createHmac("sha256", SECRET).update(payload).digest("hex");
    if (signature !== expectedSig) return null;
    const data = JSON.parse(payload);
    if (data.exp < Date.now()) return null;
    return { userId: data.userId, email: data.email };
  } catch {
    return null;
  }
}

export function generateSessionId(): string {
  return randomBytes(32).toString("hex");
}
