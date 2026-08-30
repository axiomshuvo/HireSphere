import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Card } from "@heroui/react";
import ProfileForm from "@/components/dashboard/ProfileForm";
import ProfileImageField from "@/components/dashboard/profile/ProfileImageField";
import PlanUsageCard from "@/components/dashboard/jobs/PlanUsageCard";
import SeekerPlanCard from "@/components/dashboard/profile/SeekerPlanCard";
import { redirect } from "next/navigation";
import { fetchMyApplications } from "@/lib/actions/applications";
import { getRecruiterJobStats } from "@/lib/actions/jobs";
import { getPlanUsage } from "@/lib/api/jobstruture";

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
      ? createdAt.toLocaleDateString(undefined, {
          month: "long",
          year: "numeric",
        })
      : null;

  const isRecruiter = role === "recruiter";
  const { active: activeJobCount } = isRecruiter
    ? await loadRecruiterUsage()
    : { active: 0 };
  const { total: activeApplications } = !isRecruiter
    ? await loadSeekerUsage()
    : { total: 0 };

  return (
    <div className="flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Profile
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Update your display name and profile photo. Email and role are
            managed by your account.
          </p>
        </header>

        {isRecruiter ? (
          <PlanUsageCard usage={getPlanUsage(activeJobCount, plan)} />
        ) : (
          <SeekerPlanCard plan={plan} activeApplications={activeApplications} />
        )}

        <Card className="rounded-2xl border border-default bg-content1 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold text-white">
              {name || "—"}
            </h2>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-default bg-default px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-default-foreground">
              {formatRole(role)}
            </span>
            {joined && (
              <span className="text-xs text-muted-foreground">
                · Joined {joined}
              </span>
            )}
          </div>

          <div className="mt-6 space-y-6 border-t border-default pt-6">
            <ProfileImageField name={name} image={image} />
            <ProfileForm initialName={name} email={email} role={role} />
          </div>
        </Card>
      </div>
    </div>
  );
}
