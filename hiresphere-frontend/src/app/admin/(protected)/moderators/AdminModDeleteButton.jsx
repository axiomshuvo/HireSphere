"use client";
import { Button, Tooltip, toast } from "@heroui/react";
import { TrashBin } from "@gravity-ui/icons";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { removeAdminModerator } from "@/lib/actions/admin";

export default function AdminModDeleteButton({ id }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Tooltip content="Revoke Moderator" color="danger">
      <Button
        size="sm"
        color="danger"
        variant="flat"
        isIconOnly
        disabled={isPending}
        onClick={() => {
          if (confirm("Revoke moderator privileges?")) {
            startTransition(async () => {
              try {
                await removeAdminModerator(id);
                toast.success("Moderator removed");
                router.refresh();
              } catch (err) {
                toast.danger("Failed to remove", { description: err.message });
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
