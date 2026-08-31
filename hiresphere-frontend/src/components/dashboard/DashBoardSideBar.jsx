"use client";

import { useSession } from "@/lib/auth-client";
import {
  Bookmark,
  Briefcase,
  FileCheck,
  Gear,
  LayoutCells,
  LayoutSideContent,
  Magnifier,
  OfficeBadge,
  Person,
} from "@gravity-ui/icons";
import { Avatar, Drawer } from "@heroui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const RECRUITER_NAV = [
  { icon: LayoutCells, tone: "indigo", label: "Dashboard", href: "/dashboard" },
  {
    icon: OfficeBadge,
    tone: "emerald",
    label: "Companies",
    href: "/dashboard/mycompany",
  },
  {
    icon: Briefcase,
    tone: "amber",
    label: "Manage Jobs",
    href: "/dashboard/recruiter/jobs",
  },
  {
    icon: FileCheck,
    tone: "rose",
    label: "Applications",
    href: "/dashboard/recruiter/applications",
  },
  {
    icon: Person,
    tone: "indigo",
    label: "Profile",
    href: "/dashboard/profile",
  },
  {
    icon: Gear,
    tone: "emerald",
    label: "Settings",
    href: "/dashboard/settings",
  },
];

const SEEKER_NAV = [
  { icon: LayoutCells, tone: "indigo", label: "Dashboard", href: "/dashboard" },
  { icon: Magnifier, tone: "emerald", label: "Browse Jobs", href: "/jobs" },
  {
    icon: FileCheck,
    tone: "rose",
    label: "My Applications",
    href: "/dashboard/applications",
  },
  {
    icon: Bookmark,
    tone: "amber",
    label: "Saved Jobs",
    href: "/dashboard/saved-jobs",
  },
  {
    icon: Person,
    tone: "indigo",
    label: "Profile",
    href: "/dashboard/profile",
  },
  {
    icon: Gear,
    tone: "emerald",
    label: "Settings",
    href: "/dashboard/settings",
  },
];

function isActivePath(pathname, href) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function getInitials(name) {
  const parts = name?.trim().split(/\s+/) ?? [];
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";

  return `${first}${last}`.toUpperCase() || "U";
}

function formatRole(role) {
  if (!role) return "Member";
  if (role === "seeker") return "Job Seeker";
  if (role === "recruiter") return "Recruiter";
  return role.replace(/^./, (char) => char.toUpperCase());
}

function ProfileCard({ user, compact = false }) {
  const name = user?.name ?? "User";
  const role = formatRole(user?.role);
  const initials = getInitials(name);

  return (
    <div
      className={compact ? "flex items-center gap-3" : "flex flex-col gap-3"}
    >
      <div className="flex items-center gap-3">
        <Avatar.Root className="size-10 shrink-0 rounded-full bg-default text-sm font-semibold text-default-foreground">
          {user?.image ? (
            <Avatar.Image src={user.image} alt={name} />
          ) : (
            <Avatar.Fallback>{initials}</Avatar.Fallback>
          )}
        </Avatar.Root>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {compact ? (user?.email ?? role) : role}
          </p>
        </div>
      </div>

      {!compact && (
        <span className="w-fit rounded-full border border-default bg-default px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-default-foreground">
          {user?.plan ? `${user.plan} plan` : "Free plan"}
        </span>
      )}
    </div>
  );
}

function NavLink({ item, active }) {
  const tone =
    {
      indigo: "text-indigo-300 bg-indigo-500/10 ring-indigo-500/20",
      emerald: "text-emerald-300 bg-emerald-500/10 ring-emerald-500/20",
      amber: "text-amber-300 bg-amber-500/10 ring-amber-500/20",
      rose: "text-rose-300 bg-rose-500/10 ring-rose-500/20",
    }[item.tone] ?? "text-muted-foreground bg-white/5 ring-white/10";
  const baseClass = `relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
    active
      ? "bg-default text-white ring-1 ring-white/10"
      : "text-muted-foreground hover:bg-default hover:text-white"
  }`;

  const iconEl = <item.icon className="size-5" />;

  return (
    <Link href={item.href} className={baseClass}>
      {active && (
        <span className="absolute right-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-l-full bg-white" />
      )}
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-lg ring-1 transition-colors ${tone}`}
      >
        {iconEl}
      </span>
      {item.label}
    </Link>
  );
}

export function DashBoardSideBar({ initialUser }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user ?? initialUser;

  const navItems = user?.role === "recruiter" ? RECRUITER_NAV : SEEKER_NAV;

  const navContent = (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const active = isActivePath(pathname, item.href);
        return <NavLink key={item.href} item={item} active={active} />;
      })}
    </nav>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col border-r border-default p-4 lg:flex">
        <Link href="/" className="mb-6 px-3 text-xl font-bold text-white">
          HireLoop
        </Link>

        <div className="mb-6">
          <ProfileCard user={user} />
        </div>

        <div className="flex-1">{navContent}</div>

        <div className="mt-4 border-t border-default pt-4">
          <ProfileCard user={user} compact />
        </div>
      </aside>

      <div className="border-b border-default px-4 py-3 lg:hidden">
        <Drawer>
          <Drawer.Trigger className="flex w-full cursor-pointer items-center justify-start gap-2 rounded-xl border border-white/10 bg-[#1b1c1e] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-indigo-500/50">
            <LayoutSideContent className="size-4" />
            Dashboard menu
          </Drawer.Trigger>
          <Drawer.Backdrop>
            <Drawer.Content placement="left">
              <Drawer.Dialog>
                <Drawer.CloseTrigger />
                <Drawer.Header>
                  <Drawer.Heading>HireLoop</Drawer.Heading>
                </Drawer.Header>
                <Drawer.Body>
                  <div className="mb-6">
                    <ProfileCard user={user} />
                  </div>
                  {navContent}
                </Drawer.Body>
              </Drawer.Dialog>
            </Drawer.Content>
          </Drawer.Backdrop>
        </Drawer>
      </div>
    </>
  );
}
