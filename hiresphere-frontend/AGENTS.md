/mr<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# CRITICAL RULES FOR ANY AI AGENT — READ BEFORE EVERY TASK

## 1. Check my stack before assuming anything
- ALWAYS inspect `package.json` (frontend + server), configs (`next.config.*`, `jsconfig.json`, `eslint.*`, `postcss.*`), and `src/` structure BEFORE writing or judging code.
- NEVER assume library APIs from training data. Verify real exports in `node_modules/<lib>/dist/...` (e.g. HeroUI v3 uses `Dropdown.Menu`, `Drawer.Trigger` — not NextUI v2 syntax).
- For Next.js specifics, read the local guide in `node_modules/next/dist/docs/` (Next 16 has breaking changes). Heed deprecation notices.
- If unsure about a version/API, grep/read the code and say so — do not hallucinate downgrades or upgrades.

## 2. Plan before work, wait for confirmation
- For ANY non-trivial task (multi-step, edits, deletes, renames, installs): first CHECK the code, then give a short PLAN (what files, what changes, risks), then STOP and wait for explicit confirmation.
- Do NOT start editing after an informational question (e.g. "what is X?", "tell me about Y", "check and understand"). Answer only.
- A "plan" request means plan only — do not execute until told (e.g. "do it", "all fix", "Batch 1").

## 3. No autonomous work mid-chat
- NEVER start working on your own between messages. Only act on the latest explicit instruction.
- NEVER create files unless necessary — prefer editing existing files. Never create docs (*.md) unless asked.
- NEVER commit, push, or create PRs unless explicitly requested. Before committing, show `git status` + `diff` summary.
- After edits, verify with real evidence (read the edited region, run `npm run lint` / relevant check) and report what changed + what was intentionally left untouched.

## 4. Original rule (kept)
UI libraries like HeroUI v3 introduced compound dot-notation components (e.g., `Dropdown.Menu`, `Drawer.Trigger`), which are fundamentally different from NextUI v2. Do not hallucinate downgrades.
