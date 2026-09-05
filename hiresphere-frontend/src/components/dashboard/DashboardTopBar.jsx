"use client";

import PlanUpgradeModal from "@/components/shared/PlanUpgradeModal";
import { signOut, useSession } from "@/lib/auth-client";
import { authToasts } from "@/lib/toast";
import { useTheme } from "@/providers/ThemeProvider";
import {
  ArrowChevronUp,
  ArrowRightFromSquare,
  Bell,
  Bookmark,
  Briefcase,
  ChevronDown,
  CircleQuestion,
  Envelope,
  FileCheck,
  Gear,
  House,
  Magnifier,
  Moon,
  OfficeBadge,
  Person,
  Sun,
} from "@gravity-ui/icons";
import { Avatar, Dropdown, InputGroup, Label } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const RECRUITER_DROPDOWN = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: House },
  {
    id: "companies",
    label: "Companies",
    href: "/dashboard/mycompany",
    icon: OfficeBadge,
  },
  {
    id: "manage-jobs",
    label: "Manage Jobs",
    href: "/dashboard/recruiter/jobs",
    icon: Briefcase,
  },
  {
    id: "applications",
    label: "Applications",
    href: "/dashboard/recruiter/applications",
    icon: FileCheck,
  },
  { id: "profile", label: "Profile", href: "/dashboard/profile", icon: Person },
  {
    id: "settings",
    label: "Settings",
    href: "/dashboard/settings",
    icon: Gear,
  },
];

const SEEKER_DROPDOWN = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: House },
  { id: "browse-jobs", label: "Browse Jobs", href: "/jobs", icon: Magnifier },
  {
    id: "my-applications",
    label: "My Applications",
    href: "/dashboard/applications",
    icon: FileCheck,
  },
  {
    id: "saved-jobs",
    label: "Saved Jobs",
    href: "/dashboard/saved-jobs",
    icon: Bookmark,
  },
  { id: "profile", label: "Profile", href: "/dashboard/profile", icon: Person },
  {
    id: "settings",
    label: "Settings",
    href: "/dashboard/settings",
    icon: Gear,
  },
];

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

export default function DashboardTopBar() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const user = session?.user;
  const name = user?.name ?? "User";
  const initials = getInitials(name);

  const dropdownItems =
    user?.role === "recruiter" ? RECRUITER_DROPDOWN : SEEKER_DROPDOWN;

  const handleSignOut = async () => {
    const signedOutUser = user;
    await signOut();
    authToasts.signedOut(signedOutUser);
    router.push("/");
  };

  return (
    <header className="flex items-center justify-between gap-4 border-b border-default-200 px-4 py-4 lg:px-8">
      <InputGroup className="max-w-md flex-1">
        <InputGroup.Prefix>
          <Magnifier className="size-4" />
        </InputGroup.Prefix>
        <InputGroup.Input placeholder="Search companies or jobs..." />
      </InputGroup>

      <div className="flex items-center gap-3">
        <button
          className="flex size-10 items-center justify-center rounded-xl text-default-500 transition-colors hover:bg-default-100 hover:text-foreground"
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? (
            <Sun className="size-5 text-amber-400" />
          ) : (
            <Moon className="size-5 text-indigo-400" />
          )}
        </button>
        <button
          className="flex size-10 items-center justify-center rounded-xl text-default-500 transition-colors hover:bg-default-100 hover:text-foreground"
          type="button"
        >
          <Bell className="size-5" />
        </button>
        <button
          className="flex size-10 items-center justify-center rounded-xl text-default-500 transition-colors hover:bg-default-100 hover:text-foreground"
          type="button"
        >
          <Envelope className="size-5" />
        </button>

        <Dropdown>
          <Dropdown.Trigger className="flex items-center gap-2 rounded-xl px-2 py-1 transition-colors hover:bg-default-100">
            <Avatar.Root className="size-10 shrink-0 rounded-full bg-default-100 text-sm font-semibold text-foreground">
              {user?.image ? (
                <Avatar.Image src={user.image} alt={name} />
              ) : (
                <Avatar.Fallback>{initials}</Avatar.Fallback>
              )}
            </Avatar.Root>
            <span className="hidden text-sm font-medium text-foreground md:inline">
              {isPending ? "Loading..." : name}
            </span>
            <ChevronDown className="size-4 text-default-500" />
          </Dropdown.Trigger>

          <Dropdown.Popover>
            <Dropdown.Menu aria-label="Account actions">
              {dropdownItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Dropdown.Item
                    key={item.id}
                    id={item.id}
                    href={item.href}
                    textValue={item.label}
                  >
                    <Icon className="size-4 shrink-0" />
                    <Label>{item.label}</Label>
                  </Dropdown.Item>
                );
              })}
              <Dropdown.Item
                id="upgrade"
                onAction={() => setIsPlanModalOpen(true)}
                textValue="Upgrade Plan"
              >
                <ArrowChevronUp className="size-4 shrink-0 text-indigo-300" />
                <Label>Upgrade Plan</Label>
              </Dropdown.Item>
              <Dropdown.Item id="help" href="/help" textValue="Help & Support">
                <CircleQuestion className="size-4 shrink-0" />
                <Label>Help & Support</Label>
              </Dropdown.Item>
              <Dropdown.Item
                id="signout"
                variant="danger"
                onAction={handleSignOut}
                textValue="Log out"
              >
                <ArrowRightFromSquare className="size-4 shrink-0" />
                <Label>Log out</Label>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
      </div>

      <PlanUpgradeModal
        isOpen={isPlanModalOpen}
        onOpenChange={setIsPlanModalOpen}
        role={user?.role}
        currentPlan={user?.plan}
      />
    </header>
  );
}
