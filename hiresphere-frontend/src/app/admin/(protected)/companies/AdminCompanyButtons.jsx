"use client";

import { Button, toast, Tooltip } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { approveAdminCompany, updateAdminCompanyStatus } from "@/lib/actions/admin";
import { Ban, Check, CheckShape } from "@gravity-ui/icons";

export default function AdminCompanyButtons({ id, status }) {
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

  return (
    <div className="flex gap-2">
      {status === "pending" ? (
        <Tooltip content="Approve company">
          <Button
            size="sm"
            color="primary"
            variant="solid"
            isIconOnly
            disabled={loading}
            onClick={() => run(() => approveAdminCompany(id), "Company approved")}
          >
            <CheckShape className="size-4" />
          </Button>
        </Tooltip>
      ) : null}
      
      {status === "active" ? (
        <Tooltip content="Deactivate company">
          <Button
            size="sm"
            color="danger"
            variant="flat"
            isIconOnly
            disabled={loading}
            onClick={() => run(() => updateAdminCompanyStatus(id, "deactivated"), "Company deactivated")}
          >
            <Ban className="size-4" />
          </Button>
        </Tooltip>
      ) : (
        <Tooltip content="Activate company">
          <Button
            size="sm"
            color="success"
            variant="flat"
            isIconOnly
            disabled={loading}
            onClick={() => run(() => updateAdminCompanyStatus(id, "active"), "Company activated")}
          >
            <Check className="size-4" />
          </Button>
        </Tooltip>
      )}
    </div>
  );
}
