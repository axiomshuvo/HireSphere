import { auth } from "@/lib/auth";
import {
  Bell,
  ChevronRight,
  Gear,
  Lock,
  Person,
  ShieldCheck,
} from "@gravity-ui/icons";
import { Card, Chip } from "@heroui/react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

const SECTIONS = [
  [
    Bell,
    "indigo",
    "Notifications",
    "Choose how HireSphere keeps you informed.",
    [
      ["Application updates", "Status changes and recruiter activity"],
      ["Product news", "Occasional updates about HireSphere"],
    ],
  ],
  [
    ShieldCheck,
    "emerald",
    "Privacy & security",
    "Review controls that protect your account.",
    [
      ["Profile visibility", "Control how your profile appears to recruiters"],
      ["Two-factor authentication", "Add another layer of account protection"],
    ],
  ],
  [
    Gear,
    "amber",
    "Workspace",
    "Personalize your dashboard experience.",
    [
      ["Compact dashboard", "Use tighter spacing in dashboard lists"],
      ["Language", "English (US)"],
    ],
  ],
];

const TONES = {
  indigo: "bg-indigo-500/10 text-indigo-300 ring-indigo-500/20",
  emerald: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/20",
  amber: "bg-amber-500/10 text-amber-300 ring-amber-500/20",
};

function formatRole(role) {
  if (role === "seeker") return "Job Seeker";
  if (role === "recruiter") return "Recruiter";
  return role ? role.replace(/^./, (char) => char.toUpperCase()) : "Member";
}

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/auth/signin");
  const user = session.user;

  return (
    <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">
            Workspace controls
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Settings
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Manage your HireSphere preferences and account access from one
            place.
          </p>
        </header>

        <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-[1.4fr_1fr]">
          <Card className="relative overflow-hidden rounded-2xl border border-default bg-content1 p-6 sm:p-8">
            <div className="absolute -right-10 -top-16 size-48 rounded-full bg-indigo-500/10 blur-3xl" />
            <div className="relative flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/25 to-cyan-500/10 text-indigo-200 ring-1 ring-indigo-500/30">
                <Person className="size-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                  Signed-in account
                </p>
                <h2 className="mt-1 truncate text-xl font-semibold text-white">
                  {user.name || "Your account"}
                </h2>
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {user.email}
                </p>
                <Chip
                  className="mt-4 capitalize"
                  color="primary"
                  size="sm"
                  variant="soft"
                >
                  {formatRole(user.role)} · {user.plan ?? "free"} plan
                </Chip>
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border border-default bg-content1 p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/20">
                <Lock className="size-5" />
              </div>
              <div>
                <h2 className="font-semibold text-white">Account access</h2>
                <p className="text-xs text-muted-foreground">
                  Secure login controls
                </p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-muted-foreground">
              Your email and account type are managed securely through your
              profile.
            </p>
            <Link
              href="/dashboard/profile"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-indigo-300 transition-colors hover:text-indigo-200"
            >
              Review profile
              <ChevronRight className="size-4" />
            </Link>
          </Card>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {SECTIONS.map(([Icon, tone, title, description, options]) => (
            <Card
              key={title}
              className="rounded-2xl border border-default bg-content1 p-6 sm:p-7"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 ${TONES[tone]}`}
                >
                  <Icon className="size-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-white">{title}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {description}
                  </p>
                </div>
              </div>
              <div className="mt-6 divide-y divide-default border-t border-default">
                {options.map(([label, optionDescription]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-4 py-4 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white">{label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {optionDescription}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Soon
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Settings previews are ready. Preference controls will become available
          in a future update.
        </p>
      </div>
    </div>
  );
}
