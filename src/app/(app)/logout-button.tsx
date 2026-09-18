"use client";

import { logout } from "./logout-action";

export function LogoutButton() {
  return (
    <button
      type="button"
      className="ghost"
      style={{ fontSize: "0.78rem", padding: "0.3rem 0.6rem" }}
      onClick={() => logout()}
    >
      Log out
    </button>
  );
}
