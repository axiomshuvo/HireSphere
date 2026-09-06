const fs = require('fs');

const unifiedPhases = `### Phase 1 — Foundation (Core Auth & Admin Shell)
- [ ] Create isolated \`/admin/login\` page
- [ ] Create \`AdminLayout\` with Mod/Admin role guards
- [ ] Create Admin Sidebar & Topbar UI
- [ ] Add \`ADMIN_SECRET_KEY\` and backend \`requireAdmin\` middleware
- [ ] Write \`set-admin.js\` script for initial owner promotion

### Phase 2 — User Management & Moderation
- [ ] Create \`/admin/users\` list and detail pages
- [ ] Implement Activate/Deactivate users
- [ ] **Backend Logic:** Add Cascading Deactivation (deactivating a user auto-closes jobs/companies)
- [ ] Add Mod capabilities (View individual payment history, flag users)
- [ ] Add \`GET /api/admin/users\`, \`PATCH /api/admin/users/:id/status\`

### Phase 3 — Subscriptions & Billing Flow
- [ ] Implement Automated Stripe Downgrade (\`proration_behavior: 'none'\`) to replace the Mod Queue
- [ ] **Backend Logic:** Implement Plan Reconciliation Script on webhook downgrade (auto-pause excess jobs)
- [ ] **Backend Logic:** Billing-cycle Quota Math (calculate limits based on Stripe period, not calendar month)
- [ ] **Backend Logic:** Add Subscription History Ledger (push events to \`subscriptions.history\` array)

### Phase 4 — Company & Job Moderation
- [ ] Create \`/admin/companies\` & \`/admin/jobs\` moderation pages
- [ ] Implement Company Approval Flow (\`pending\` status upon creation, jobs hidden until approved)
- [ ] **Backend Logic:** Apply-Button Race Condition fix (verify active status at exact moment of apply)
- [ ] **Backend Logic:** Orphaned Image ImgBB deletion hook

### Phase 5 — Owner Features (Admin Only)
- [ ] Create Plan Management CRUD (\`/admin/plans\`)
- [ ] Create Revenue Dashboard fetching from Stripe API (\`/admin/revenue\`)
- [ ] Create Moderator Management (invite/remove mods via \`/admin/moderators\`)`;

// 1. Update ARCHITECTURE.md
let arch = fs.readFileSync('ARCHITECTURE.md', 'utf8');
arch = arch.replace(/### Phase 1 — Core Auth & Routing[\s\S]*?(?=---)/, unifiedPhases + '\n\n');
fs.writeFileSync('ARCHITECTURE.md', arch);

// 2. Update AUDIT.md
let audit = fs.readFileSync('AUDIT.md', 'utf8');
// Find the exact block in AUDIT.md
const auditPhaseMatch = audit.match(/#### Phase 1 — Foundation \(Must Have\)[\s\S]*?(?=---)/);
if (auditPhaseMatch) {
  audit = audit.replace(auditPhaseMatch[0], unifiedPhases.replace(/###/g, '####') + '\n\n');
  fs.writeFileSync('AUDIT.md', audit);
  console.log("Both files updated with Unified Phases");
} else {
  console.log("Could not find Phase block in AUDIT.md to replace");
}
