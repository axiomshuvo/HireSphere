"use client";

import { authClient, signOut, useSession } from "@/lib/auth-client";
import { Avatar, Dropdown, Label } from "@heroui/react";
import { useRouter } from "next/navigation";
import { ChevronDown, ArrowRightFromSquare, ShieldCheck } from "@gravity-ui/icons";

export default function AdminTopbar() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  const handleSignOut = async () => {
    await signOut();
    router.push("/admin/login");
  };

  const name = user?.name ?? user?.email ?? "Admin";
  const initials = name[0]?.toUpperCase() ?? "A";

  return (
    <header className="flex items-center justify-between border-b border-default-200 bg-content1 px-4 py-3 lg:px-8">
      <div className="flex items-center gap-2">
        <ShieldCheck className="size-5 text-indigo-500" />
        <p className="text-sm font-semibold text-foreground">HireSphere Command</p>
      </div>
      
      <Dropdown>
        <Dropdown.Trigger className="flex items-center gap-2 rounded-xl px-2 py-1 transition-colors hover:bg-default-100 cursor-pointer border-none outline-none">
          <Avatar.Root className="size-10 shrink-0 rounded-full bg-default-100 text-sm font-semibold text-foreground">
            {user?.image ? (
              <Avatar.Image src={user.image} alt={name} />
            ) : (
              <Avatar.Fallback>{initials}</Avatar.Fallback>
            )}
          </Avatar.Root>
          <span className="hidden text-sm font-medium text-foreground md:inline">
            {name}
          </span>
          <ChevronDown className="size-4 text-default-500" />
        </Dropdown.Trigger>

        <Dropdown.Popover>
          <Dropdown.Menu aria-label="Admin actions">
            <Dropdown.Item id="role" textValue="role" className="opacity-70 pointer-events-none">
              <Label>{user?.email} · {user?.role}</Label>
            </Dropdown.Item>
            <Dropdown.Item id="signout" variant="danger" onAction={handleSignOut} textValue="Log out">
              <ArrowRightFromSquare className="size-4 shrink-0 text-danger" />
              <Label className="text-danger">Log out</Label>
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
    </header>
  );
}

// Re-export for tree-shaking safety in tests
export { authClient };
