"use client";

import { signOut, useSession } from "@/lib/auth-client";
import {
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
  OfficeBadge,
  Person,
} from "@gravity-ui/icons";
import { Avatar, Dropdown, InputGroup, Label, toast } from "@heroui/react";
import { useRouter } from "next/navigation";

const RECRUITER_DROPDOWN = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: House },
  { id: "my-company", label: "My Company", href: "/dashboard/mycompany", icon: OfficeBadge },
  { id: "manage-jobs", label: "Manage Jobs", href: "/dashboard/recruiter/jobs", icon: Briefcase },
  { id: "applications", label: "Applications", href: "/dashboard/applications", icon: FileCheck },
  { id: "settings", label: "Settings", href: "/dashboard/settings", icon: Gear },
];

const SEEKER_DROPDOWN = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: House },
  { id: "browse-jobs", label: "Browse Jobs", href: "/jobs", icon: Magnifier },
  { id: "my-applications", label: "My Applications", href: "/dashboard/applications", icon: FileCheck },
  { id: "saved-jobs", label: "Saved Jobs", href: "/dashboard/saved-jobs", icon: Bookmark, comingSoon: true },
  { id: "profile", label: "Profile", href: "/dashboard/profile", icon: Person, comingSoon: true },
  { id: "settings", label: "Settings", href: "/dashboard/settings", icon: Gear },
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

  const user = session?.user;
  const name = user?.name ?? "User";
  const initials = getInitials(name);

  const dropdownItems = user?.role === "recruiter" ? RECRUITER_DROPDOWN : SEEKER_DROPDOWN;

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <header className="flex items-center justify-between gap-4 border-b border-default px-4 py-4 lg:px-8">
      <InputGroup className="max-w-md flex-1">
        <InputGroup.Prefix>
          <Magnifier className="size-4" />
        </InputGroup.Prefix>
        <InputGroup.Input placeholder="Search companies or jobs..." />
      </InputGroup>

      <div className="flex items-center gap-3">
        <button
          className="flex size-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-default hover:text-white"
          type="button"
        >
          <Bell className="size-5" />
        </button>
        <button
          className="flex size-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-default hover:text-white"
          type="button"
        >
          <Envelope className="size-5" />
        </button>

        <Dropdown>
          <Dropdown.Trigger className="flex items-center gap-2 rounded-xl px-2 py-1 transition-colors hover:bg-default">
            <Avatar.Root className="size-10 shrink-0 rounded-full bg-default text-sm font-semibold text-default-foreground">
              {user?.image ? (
                <Avatar.Image src={user.image} alt={name} />
              ) : (
                <Avatar.Fallback>{initials}</Avatar.Fallback>
              )}
            </Avatar.Root>
            <span className="hidden text-sm font-medium text-white md:inline">
              {isPending ? "Loading..." : name}
            </span>
            <ChevronDown className="size-4 text-muted-foreground" />
          </Dropdown.Trigger>

          <Dropdown.Popover>
            <Dropdown.Menu aria-label="Account actions">
              {dropdownItems.map((item) => {
                const Icon = item.icon;
                if (item.comingSoon) {
                  return (
                    <Dropdown.Item
                      key={item.id}
                      id={item.id}
                      textValue={item.label}
                      onAction={() =>
                        toast.info("Coming soon", {
                          description: "This page is not ready yet",
                        })
                      }
                    >
                      <Icon className="size-4 shrink-0" />
                      <Label>{item.label}</Label>
                    </Dropdown.Item>
                  );
                }
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
                id="help"
                href="/dashboard/help"
                textValue="Help & Support"
              >
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
    </header>
  );
}
