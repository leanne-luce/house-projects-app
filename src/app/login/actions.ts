"use server";

import { redirect } from "next/navigation";
import { checkPassphrase, createSession } from "@/lib/auth";

export async function login(_prevState: { error?: string } | undefined, formData: FormData) {
  const passphrase = String(formData.get("passphrase") || "");
  const from = String(formData.get("from") || "/houses");

  // checkPassphrase/getSecret throw if APP_PASSPHRASE or SESSION_SECRET
  // aren't set at all (e.g. forgot to add them in Vercel, or added them
  // under the wrong environment scope) — caught here so that surfaces as
  // a clear message on the login form instead of a generic crashed-page
  // Server Action error, which looks identical to a wrong passphrase.
  let ok: boolean;
  try {
    ok = checkPassphrase(passphrase);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Server misconfigured." };
  }
  if (!ok) {
    return { error: "That's not it — try again." };
  }

  await createSession();
  redirect(from || "/houses");
}
