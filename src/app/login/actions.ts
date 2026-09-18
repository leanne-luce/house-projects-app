"use server";

import { redirect } from "next/navigation";
import { checkPassphrase, createSession } from "@/lib/auth";

export async function login(_prevState: { error?: string } | undefined, formData: FormData) {
  const passphrase = String(formData.get("passphrase") || "");
  const from = String(formData.get("from") || "/houses");

  if (!checkPassphrase(passphrase)) {
    return { error: "That's not it — try again." };
  }

  await createSession();
  redirect(from || "/houses");
}
