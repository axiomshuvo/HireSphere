"use client";

import { Button, Tooltip } from "@heroui/react";
import { Check, Xmark } from "@gravity-ui/icons";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { approveAdminRequest, rejectAdminRequest } from "@/lib/actions/admin";
import { authToasts } from "@/lib/toast";

export default function AdminRequestButtons({ id }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const run = (actionPromise, msg) => {
    startTransition(async () => {
      try {
        await actionPromise;
        authToasts.success(msg);
        router.refresh();
      } catch (e) {
        authToasts.error(e.message || "Action failed");
      }
    });
  };

  return (
    <div className="flex gap-2">
      <Tooltip content="Approve Request" color="success">
        <Button 
          size="sm" 
          color="success" 
          variant="flat"
          isIconOnly
          isLoading={isPending} 
          onClick={() => run(approveAdminRequest(id), "Request approved")}
        >
          {!isPending && <Check className="size-4" />}
        </Button>
      </Tooltip>
      <Tooltip content="Reject Request" color="danger">
        <Button 
          size="sm" 
          color="danger" 
          variant="flat"
          isIconOnly
          isLoading={isPending} 
          onClick={() => run(rejectAdminRequest(id), "Request rejected")}
        >
          {!isPending && <Xmark className="size-4" />}
        </Button>
      </Tooltip>
    </div>
  );
}
