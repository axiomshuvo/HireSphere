const fs = require('fs');
let agents = fs.readFileSync('AGENTS.md', 'utf8');

const newRules = `## 1. Check my stack before assuming anything
- ALWAYS inspect \`package.json\` (frontend + server), configs (\`next.config.*\`, \`jsconfig.json\`, \`eslint.*\`, \`postcss.*\`), and \`src/\` structure BEFORE writing or judging code.
- ONLY use the libraries listed in my \`package.json\`. DO NOT introduce new libraries, packages, or tools unless explicitly told to do so.
- ALWAYS use the updated version of the libraries I have installed. 
- NEVER assume library APIs from training data. Verify real exports in \`node_modules/<lib>/dist/...\` (e.g. HeroUI v3 uses \`Dropdown.Menu\`, \`Drawer.Trigger\` — not NextUI v2 syntax).`;

agents = agents.replace(
  /## 1\. Check my stack before assuming anything[\s\S]*?hallucinate downgrades or upgrades\./,
  newRules
);

fs.writeFileSync('AGENTS.md', agents);
console.log('AGENTS.md updated');
