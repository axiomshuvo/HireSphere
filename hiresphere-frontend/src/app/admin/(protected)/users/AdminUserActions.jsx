"use client";

import { Button, toast, Tooltip } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { flagAdminUser, updateAdminUserStatus } from "@/lib/actions/admin";
import { Ban, Check, ShieldCheck } from "@gravity-ui/icons";

export default function AdminUserActions({ id, status }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [localLoading, setLocalLoading] = useState(false);
  const active = (status ?? "active") === "active";

  const run = async (actionFn, okMsg) => {
    setLocalLoading(true);
    try {
      await actionFn();
      if (toast.success) toast.success(okMsg);
      else console.log(okMsg); // Fallback if toast breaks
      
      startTransition(() => {
        router.refresh();
      });
    } catch (e) {
      if (toast.danger) toast.danger("Action failed", { description: e.message });
      else if (toast.error) toast.error(e.message);
      else console.error("Action failed:", e.message);
    } finally {
      setLocalLoading(false);
    }
  };

  const loading = isPending || localLoading;

  return (
    <div className="flex gap-2">
      {active ? (
        <Tooltip content="Disable account">
          <Button
            size="sm"
            color="danger"
            variant="flat"
            isIconOnly
            disabled={loading}
            onClick={() => run(() => updateAdminUserStatus(id, "deactivated"), "User deactivated")}
          >
            <Ban className="size-4" />
          </Button>
        </Tooltip>
      ) : (
        <Tooltip content="Re-activate account">
          <Button
            size="sm"
            color="success"
            variant="flat"
            isIconOnly
            disabled={loading}
            onClick={() => run(() => updateAdminUserStatus(id, "active"), "User activated")}
          >
            <Check className="size-4" />
          </Button>
        </Tooltip>
      )}
      
      <Tooltip content="Flag user for review">
        <Button
          size="sm"
          color="warning"
          variant="flat"
          isIconOnly
          disabled={loading}
          onClick={() => run(() => flagAdminUser(id, true, "Flagged from admin list"), "User flagged")}
        >
          <ShieldCheck className="size-4" />
        </Button>
      </Tooltip>
    </div>
  );
}
