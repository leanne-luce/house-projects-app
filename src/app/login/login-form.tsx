"use client";

import { useActionState } from "react";
import { login } from "./actions";

export function LoginForm({ from }: { from: string }) {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <div className="login-wrap">
      <form action={formAction} className="card login-card">
        <h1>🏠 House Projects Hub</h1>
        <div className="field">
          <label className="field-label" htmlFor="passphrase">
            Passphrase
          </label>
          <input
            id="passphrase"
            name="passphrase"
            type="password"
            autoFocus
            autoComplete="current-password"
          />
        </div>
        <input type="hidden" name="from" value={from} />
        <button
          className="primary"
          type="submit"
          disabled={pending}
          style={{ width: "100%", marginTop: "0.75rem" }}
        >
          {pending ? "Checking…" : "Enter"}
        </button>
        {state?.error ? <div className="login-error">{state.error}</div> : null}
      </form>
    </div>
  );
}
