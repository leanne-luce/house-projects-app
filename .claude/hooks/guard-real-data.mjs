#!/usr/bin/env node
// PreToolUse guard on the Bash tool for this project. Blocks the exact
// class of command that caused a real data-loss incident: a blanket
// `rm -rf .uploads/*` wiped real uploaded photos and a receipt PDF during
// test cleanup, because test and real storage shared one folder. See
// PLAN.md's "Test/real data isolation" section for the full story and the
// isolated house_projects_test / .uploads-test setup this guard points
// toward instead.
//
// Deliberately conservative: blocks blanket deletes of the *bare* .uploads
// folder (or a `.uploads/*` wildcard), never a specifically-named file
// inside it (`rm .uploads/abc123-photo.jpg` stays allowed, since that's
// sometimes a legitimate, deliberate cleanup of one file). Never touches
// .uploads-test, which is safe to wipe freely.

let input = "";
process.stdin.on("data", (d) => (input += d));
process.stdin.on("end", () => {
  let payload;
  try {
    payload = JSON.parse(input);
  } catch {
    process.exit(0);
  }
  const command = (payload && payload.tool_input && payload.tool_input.command) || "";
  const reason = checkCommand(command);
  if (reason) {
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "deny",
          permissionDecisionReason: reason,
        },
      })
    );
  }
  process.exit(0);
});

const INCIDENT_NOTE =
  "This project had a real data-loss incident from exactly this pattern (see PLAN.md, \"Test/real data isolation\").";

// Does `cmd` reference the bare .uploads folder or a .uploads/* wildcard —
// as opposed to .uploads-test, or a specific named file inside .uploads/?
function hasBlanketUploadsTarget(cmd) {
  const re = /(^|[\s"'/])\.uploads(?=$|[\s"'/])/g;
  let m;
  while ((m = re.exec(cmd))) {
    const rest = cmd.slice(m.index + m[0].length);
    if (rest.startsWith("-")) continue; // e.g. .uploads-test — a different name entirely
    if (rest.startsWith("/")) {
      const afterSlash = rest.slice(1);
      if (afterSlash === "" || /^[\s"']/.test(afterSlash)) return true; // bare trailing slash
      if (/^\*($|[\s"'])/.test(afterSlash)) return true; // .uploads/*
      continue; // .uploads/<specific-deeper-path> — a real, named target, allow
    }
    return true; // bare ".uploads" with nothing after it
  }
  return false;
}

function checkCommand(cmd) {
  if (!cmd) return null;

  // ---- 1. Blanket delete of the real .uploads folder ----
  if (/\brm\b/.test(cmd) && hasBlanketUploadsTarget(cmd)) {
    return (
      `Blocked: this looks like a blanket delete of the real .uploads folder ` +
      `(an "rm" targeting .uploads itself or a .uploads/* wildcard, not one named file inside it). ` +
      `${INCIDENT_NOTE} Use .uploads-test for any test cleanup instead — it's isolated and safe to wipe freely. ` +
      `If you genuinely need to remove one real file, name it exactly (e.g. "rm .uploads/<specific-filename>").`
    );
  }
  // Same danger, via `find` instead of `rm`.
  if (/\bfind\b/.test(cmd) && hasBlanketUploadsTarget(cmd) && /-delete\b|-exec\s+rm\b/.test(cmd)) {
    return (
      `Blocked: this looks like a "find .uploads ... -delete"/"-exec rm" sweep of the real .uploads folder. ` +
      `${INCIDENT_NOTE} Use .uploads-test for any test cleanup instead.`
    );
  }

  // ---- 2. Destructive, unscoped SQL against the real database ----
  if (/house_projects_dev/.test(cmd)) {
    if (/\bdropdb\b/i.test(cmd)) {
      return (
        `Blocked: this looks like it drops the real database (house_projects_dev). ` +
        `${INCIDENT_NOTE} Use house_projects_test for any testing instead.`
      );
    }
    if (/\bDROP\s+DATABASE\b/i.test(cmd)) {
      return (
        `Blocked: DROP DATABASE against the real database (house_projects_dev). ` +
        `${INCIDENT_NOTE} Use house_projects_test for any testing instead.`
      );
    }
    if (/\bTRUNCATE\b/i.test(cmd)) {
      return (
        `Blocked: TRUNCATE against the real database (house_projects_dev). ` +
        `${INCIDENT_NOTE} Use house_projects_test for any testing instead.`
      );
    }
    const hasUnscopedDelete = cmd
      .split(";")
      .some((stmt) => /\bDELETE\s+FROM\b/i.test(stmt) && !/\bWHERE\b/i.test(stmt));
    if (hasUnscopedDelete) {
      return (
        `Blocked: a DELETE with no WHERE clause against the real database (house_projects_dev). ` +
        `${INCIDENT_NOTE} Scope it with a WHERE clause to specific IDs, or use house_projects_test for testing instead.`
      );
    }
  }

  return null;
}
