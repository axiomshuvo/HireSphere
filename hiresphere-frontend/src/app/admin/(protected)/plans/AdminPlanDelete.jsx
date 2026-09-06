"use client";

import { Button, Tooltip } from "@heroui/react";
import { TrashBin } from "@gravity-ui/icons";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteAdminPlan } from "@/lib/actions/admin";
import { authToasts } from "@/lib/toast";

export default function AdminPlanDelete({ id }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Tooltip content="Delete Plan" color="danger">
      <Button
        size="sm"
        color="danger"
        variant="flat"
        isIconOnly
        isLoading={isPending}
        onClick={() => {
          if (confirm("Permanently delete this plan? This may break active subscriptions.")) {
            startTransition(async () => {
              try {
                await deleteAdminPlan(id);
                authToasts.success("Plan deleted");
                router.refresh();
              } catch (err) {
                authToasts.error(err.message || "Delete failed");
              }
            });
          }
        }}
      >
        {!isPending && <TrashBin className="size-4" />}
      </Button>
    </Tooltip>
  );
}
