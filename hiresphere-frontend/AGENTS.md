/mr<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# CRITICAL RULE: Version Check Before Reading Files

ALWAYS check `package.json` for library versions and verify the component exports/API (e.g. `node_modules/@heroui/react/dist/components/...`) BEFORE assuming syntax is incorrect.
UI libraries like HeroUI v3 introduced compound dot-notation components (e.g., `Dropdown.Menu`, `Drawer.Trigger`), which are fundamentally different from NextUI v2. Do not hallucinate downgrades.
