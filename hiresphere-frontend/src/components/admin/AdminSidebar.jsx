"use client";

import Logo from "@/components/shared/Logo";
import { useSession } from "@/lib/auth-client";
import {
  Briefcase,
  FileCheck,
  Gear,
  LayoutCells,
  OfficeBadge,
  Person,
  Star,
  LayoutSideContent,
  ShieldCheck,
  FileDollar,
  ListTimeline
} from "@gravity-ui/icons";
import { Avatar, Drawer } from "@heroui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ADMIN_NAV = [
  { icon: LayoutCells, tone: "indigo", label: "Overview", href: "/admin" },
  { icon: Person, tone: "emerald", label: "Users", href: "/admin/users" },
  { icon: FileCheck, tone: "amber", label: "Requests", href: "/admin/requests" },
  { icon: OfficeBadge, tone: "rose", label: "Companies", href: "/admin/companies" },
  { icon: Briefcase, tone: "indigo", label: "Jobs", href: "/admin/jobs" },
  { icon: Star, tone: "emerald", label: "Plans", href: "/admin/plans", adminOnly: true },
  { icon: FileDollar, tone: "amber", label: "Revenue", href: "/admin/revenue", adminOnly: true },
  { icon: ShieldCheck, tone: "rose", label: "Moderators", href: "/admin/moderators", adminOnly: true },
  { icon: ListTimeline, tone: "indigo", label: "Activity", href: "/admin/activity" },
  { icon: Gear, tone: "emerald", label: "Settings", href: "/admin/settings" },
];

function isActivePath(pathname, href) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getInitials(name) {
  const parts = name?.trim().split(/s+/) ?? [];
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return `${first}${last}`.toUpperCase() || "A";
}

function NavLink({ item, active }) {
  const toneMap = {
    indigo: "text-indigo-500 bg-indigo-500/10 ring-indigo-500/20",
    emerald: "text-emerald-500 bg-emerald-500/10 ring-emerald-500/20",
    amber: "text-amber-500 bg-amber-500/10 ring-amber-500/20",
    rose: "text-rose-500 bg-rose-500/10 ring-rose-500/20",
  };
  const tone = toneMap[item.tone] ?? "text-default-500 bg-white/5 ring-(color-accent)/20";
  const baseClass = `relative flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
    active
      ? "bg-default-100 text-foreground ring-1 ring-indigo-500/20"
      : "text-default-500 hover:bg-default-100 hover:text-foreground"
  }`;

  const Icon = item.icon;

  return (
    <Link href={item.href} className={baseClass}>
      {active && (
        <span className="absolute right-0 top-1/2 h-6 w-1 -translate-y-1/2 bg-indigo-500" />
      )}
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-lg ring-1 transition-colors ${tone}`}
      >
        <Icon className="size-4" />
      </span>
      {item.label}
    </Link>
  );
}

function ProfileCard({ user, compact = false }) {
  const name = user?.name ?? "Admin";
  const role = user?.role === "mod" ? "Moderator" : "Owner";
  const initials = getInitials(name);

  return (
    <div className={compact ? "flex items-center gap-3" : "flex flex-col gap-3"}>
      <div className="flex items-center gap-3">
        <Avatar.Root className="size-10 shrink-0 rounded-full bg-default-100 text-sm font-semibold text-foreground flex items-center justify-center">
          {user?.image ? (
            <Avatar.Image src={user.image} alt={name} />
          ) : (
            <Avatar.Fallback>{initials}</Avatar.Fallback>
          )}
        </Avatar.Root>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{name}</p>
          <p className="truncate text-xs text-default-500">
            {compact ? (user?.email ?? role) : role}
          </p>
        </div>
      </div>

      {!compact && (
        <span className="w-fit rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-500">
          ADMIN · {role}
        </span>
      )}
    </div>
  );
}

export default function AdminSidebar({ initialUser }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user ?? initialUser;
  const isAdmin = user?.role === "admin";
  const navItems = ADMIN_NAV.filter((item) => !item.adminOnly || isAdmin);

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
      <aside className="hidden w-64 shrink-0 flex-col border-r border-default-200 p-4 lg:flex bg-content1/50 backdrop-blur-xl">
        <div className="mb-6 px-3">
          <Logo href="/admin" />
        </div>

        <div className="mb-6">
          <ProfileCard user={user} />
        </div>

        <div className="flex-1 overflow-y-auto">{navContent}</div>

        <div className="mt-4 border-t border-default-200 pt-4">
          <ProfileCard user={user} compact />
        </div>
      </aside>

      <div className="border-b border-default-200 px-4 py-3 lg:hidden bg-content1">
        <Drawer>
          <Drawer.Trigger className="flex w-full cursor-pointer items-center justify-start gap-2 rounded-xl border border-default-200 bg-default-100 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-indigo-500/50">
            <LayoutSideContent className="size-4" />
            Admin menu
          </Drawer.Trigger>
          <Drawer.Backdrop>
            <Drawer.Content placement="left">
              <Drawer.Dialog>
                <Drawer.CloseTrigger />
                <Drawer.Header>
                  <Logo href="/admin" />
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
