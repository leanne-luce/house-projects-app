// Single-owner passphrase gate. No third-party auth vendor, no user table —
// see the plan's "Proposed stack" rationale: this is a single-owner tool
// (build brief section 9), so a signed, stateless session cookie checked
// against one env-configured passphrase is enough, and it avoids any
// email-deliverability dependency that could lock Leanne out.

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "house_hub_session";
const SESSION_DURATION = "30d";

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET is not set. Copy .env.example to .env.local and set a long random value."
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createSession() {
  const token = await new SignJWT({ authorized: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(getSecret());

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function hasValidSession(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

export function checkPassphrase(input: string): boolean {
  const expected = process.env.APP_PASSPHRASE;
  if (!expected) {
    throw new Error("APP_PASSPHRASE is not set. Copy .env.example to .env.local and set one.");
  }
  // Constant-time-ish comparison to avoid trivial timing leaks on a
  // single-user gate. Not a full security-critical auth system — matches
  // the "single owner, no OAuth" scope this needs.
  if (input.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < input.length; i++) {
    mismatch |= input.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0;
}

export { COOKIE_NAME };
