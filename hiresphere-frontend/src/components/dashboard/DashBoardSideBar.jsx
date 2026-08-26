"use client";

import { useSession } from "@/lib/auth-client";
import {
  Briefcase,
  FileCheck,
  Gear,
  LayoutCells,
  LayoutSideContent,
  OfficeBadge,
} from "@gravity-ui/icons";
import { Avatar, Button, Drawer } from "@heroui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { icon: LayoutCells, label: "Dashboard", href: "/dashboard" },
  { icon: OfficeBadge, label: "My Company", href: "/dashboard/mycompany" },
  { icon: Briefcase, label: "Manage Jobs", href: "/dashboard/recruiter/jobs" },
  { icon: FileCheck, label: "Applications", href: "/dashboard/applications" },
  { icon: Gear, label: "Settings", href: "/dashboard/settings" },
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
    <div className={compact ? "flex items-center gap-3" : "flex flex-col gap-3"}>
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
            {compact ? user?.email ?? role : role}
          </p>
        </div>
      </div>

      {!compact && (
        <span className="w-fit rounded-full border border-default bg-default px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-default-foreground">
          Premium Account
        </span>
      )}
    </div>
  );
}

export function DashBoardSideBar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  const navContent = (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const active = isActivePath(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
              active
                ? "bg-default text-white"
                : "text-muted-foreground hover:bg-default hover:text-white"
            }`}
          >
            {active && (
              <span className="absolute right-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-l-full bg-white" />
            )}
            <item.icon className="size-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-default p-4">
        <Link href="/dashboard" className="mb-6 px-3 text-xl font-bold text-white">
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

      <Drawer>
        <Button className="lg:hidden" variant="secondary">
          <LayoutSideContent />
          Menu
        </Button>
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
    </>
  );
}
