"use client";

import { signOut, useSession } from "@/lib/auth-client";
import {
  ArrowRightFromSquare,
  Bell,
  Briefcase,
  ChevronDown,
  CircleQuestion,
  Envelope,
  FileCheck,
  Gear,
  House,
  Magnifier,
  OfficeBadge,
} from "@gravity-ui/icons";
import { Avatar, Dropdown, InputGroup, Label } from "@heroui/react";
import { useRouter } from "next/navigation";

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
              <Dropdown.Item
                id="dashboard"
                href="/dashboard"
                textValue="Dashboard"
              >
                <House className="size-4 shrink-0" />
                <Label>Dashboard</Label>
              </Dropdown.Item>
              <Dropdown.Item
                id="my-company"
                href="/dashboard/mycompany"
                textValue="My Company"
              >
                <OfficeBadge className="size-4 shrink-0" />
                <Label>My Company</Label>
              </Dropdown.Item>
              <Dropdown.Item
                id="manage-jobs"
                href="/dashboard/recruiter/jobs"
                textValue="Manage Jobs"
              >
                <Briefcase className="size-4 shrink-0" />
                <Label>Manage Jobs</Label>
              </Dropdown.Item>
              <Dropdown.Item
                id="applications"
                href="/dashboard/applications"
                textValue="Applications"
              >
                <FileCheck className="size-4 shrink-0" />
                <Label>Applications</Label>
              </Dropdown.Item>
              <Dropdown.Item
                id="settings"
                href="/dashboard/settings"
                textValue="Settings"
              >
                <Gear className="size-4 shrink-0" />
                <Label>Settings</Label>
              </Dropdown.Item>
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
                onPress={handleSignOut}
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
