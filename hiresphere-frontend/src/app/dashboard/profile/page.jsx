import ProfileForm from "@/components/dashboard/ProfileForm";
import PlanUsageCard from "@/components/dashboard/jobs/PlanUsageCard";
import ProfileImageField from "@/components/dashboard/profile/ProfileImageField";
import SeekerPlanCard from "@/components/dashboard/profile/SeekerPlanCard";
import { fetchMyApplications } from "@/lib/actions/applications";
import { getRecruiterJobStats } from "@/lib/actions/jobs";
import { getPlans } from "@/lib/actions/plans";
import { getPlanUsage } from "@/lib/api/jobstruture";
import { auth } from "@/lib/auth";
import { Calendar, Envelope, Person } from "@gravity-ui/icons";
import { Card, Chip } from "@heroui/react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

function formatRole(role) {
  if (role === "seeker") return "Job Seeker";
  if (role === "recruiter") return "Recruiter";
  if (!role) return "Member";
  return role.replace(/^./, (c) => c.toUpperCase());
}

async function loadSeekerUsage() {
  try {
    const result = await fetchMyApplications({ page: 1, pageSize: 100 });
    const total = typeof result?.total === "number" ? result.total : 0;
    return { total };
  } catch {
    return { total: 0 };
  }
}

async function loadRecruiterUsage() {
  try {
    const stats = await getRecruiterJobStats();
    return { active: stats?.active ?? 0 };
  } catch {
    return { active: 0 };
  }
}

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/auth/signin");
  const user = session.user;
  const name = user.name ?? "";
  const email = user.email ?? "";
  const role = user.role ?? "seeker";
  const image = user.image ?? null;
  const plan = user.plan ?? "free";
  const createdAt = user.createdAt ? new Date(user.createdAt) : null;
  const joined =
    createdAt && !Number.isNaN(createdAt.getTime())
      ? createdAt.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
      : null;

  const isRecruiter = role === "recruiter";

  const [recruiterUsage, seekerUsage, allPlans] = await Promise.all([
    isRecruiter ? loadRecruiterUsage() : Promise.resolve({ active: 0 }),
    !isRecruiter ? loadSeekerUsage() : Promise.resolve({ total: 0 }),
    getPlans(role),
  ]);

  const { active: activeJobCount } = recruiterUsage;
  const { total: activeApplications } = seekerUsage;

  const userPlan =
    (allPlans || []).find((p) => (p.planId || p.id) === plan) || null;

  return (
    <div className="flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Account workspace
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Your profile
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Keep your identity and account details current across HireSphere.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Card className="rounded-2xl border border-default bg-content1 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <ProfileImageField name={name} image={image} />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                    {name || "Complete your profile"}
                  </h2>
                  <Chip color="primary" size="sm" variant="flat">
                    {formatRole(role)}
                  </Chip>
                </div>
                <p className="mt-1 text-sm text-default-500">{email}</p>
                <p className="mt-3 text-xs text-default-500 max-w-sm">
                  Click the avatar to update your profile photo. PNG, JPG, WebP
                  up to 5MB.
                </p>
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border border-default bg-content1 p-6 sm:p-8">
            <h2 className="text-sm font-medium uppercase tracking-widest text-default-500">
              Account snapshot
            </h2>
            <div className="mt-6 flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-default-100">
                  <Envelope className="size-4 text-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-default-500">
                    Email
                  </p>
                  <p className="truncate text-sm font-medium text-foreground">
                    {email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-default-100">
                  <Person className="size-4 text-foreground" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-default-500">
                    Account type
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {formatRole(role)}
                  </p>
                </div>
              </div>
              {joined && (
                <div className="flex items-center gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-default-100">
                    <Calendar className="size-4 text-foreground" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-default-500">
                      Member since
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {joined}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </section>

        {isRecruiter ? (
          <PlanUsageCard usage={getPlanUsage(activeJobCount, userPlan)} />
        ) : (
          <SeekerPlanCard
            userPlan={userPlan}
            activeApplications={activeApplications}
          />
        )}

        <Card className="rounded-2xl border border-default bg-content1 p-6 sm:p-8">
          <div className="mb-8 border-b border-default pb-6">
            <h2 className="text-xl font-semibold text-foreground">
              Personal details
            </h2>
            <p className="mt-2 text-sm text-default-500">
              Update the name shown on your profile and dashboard.
            </p>
          </div>
          <ProfileForm initialName={name} email={email} role={role} />
        </Card>
      </div>
    </div>
  );
}
