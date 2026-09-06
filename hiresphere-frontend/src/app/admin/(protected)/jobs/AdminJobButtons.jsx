"use client";

import { Button, toast, Tooltip } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateAdminJobStatus, deleteAdminJob } from "@/lib/actions/admin";
import { Ban, TrashBin } from "@gravity-ui/icons";

export default function AdminJobButtons({ id, status }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [localLoading, setLocalLoading] = useState(false);

  const run = async (fn, okMsg) => {
    setLocalLoading(true);
    try {
      await fn();
      if (toast.success) toast.success(okMsg);
      else console.log(okMsg);
      
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
  const isClosed = status === "closed";

  return (
    <div className="flex gap-2">
      <Tooltip content={isClosed ? "Job already closed" : "Force close job"}>
        <Button
          size="sm"
          color="warning"
          variant="flat"
          isIconOnly
          isDisabled={isClosed}
          disabled={loading}
          onClick={() => run(() => updateAdminJobStatus(id, "closed"), "Job force-closed")}
        >
          <Ban className="size-4" />
        </Button>
      </Tooltip>
      
      <Tooltip content="Permanently delete job">
        <Button
          size="sm"
          color="danger"
          variant="flat"
          isIconOnly
          disabled={loading}
          onClick={() => run(() => deleteAdminJob(id), "Job deleted")}
        >
          <TrashBin className="size-4" />
        </Button>
      </Tooltip>
    </div>
  );
}
