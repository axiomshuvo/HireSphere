"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, toast } from "@heroui/react";
import { Xmark } from "@gravity-ui/icons";
import { withdrawApplication } from "@/lib/actions/applications";

export default function WithdrawApplicationButton({ jobId, jobTitle, className = "" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handleWithdraw = async () => {
    setLoading(true);
    try {
      await withdrawApplication(jobId);
      toast.success("Application withdrawn", {
        description: `Your application for ${jobTitle ?? "this role"} has been removed.`,
      });
      router.refresh();
    } catch (error) {
      toast.danger("Could not withdraw application", {
        description: error?.message ?? "Unknown error",
      });
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-xs text-muted-foreground">Withdraw?</span>
        <Button
          size="sm"
          radius="md"
          variant="flat"
          color="default"
          isDisabled={loading}
          onPress={() => setConfirming(false)}
          className="cursor-pointer text-xs"
        >
          Cancel
        </Button>
        <Button
          size="sm"
          radius="md"
          color="danger"
          isLoading={loading}
          onPress={handleWithdraw}
          className="cursor-pointer text-xs"
        >
          Yes, withdraw
        </Button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className={`inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-1.5 text-xs font-medium text-red-300 transition-colors hover:border-red-500/60 hover:bg-red-500/10 lg:w-auto ${className}`}
    >
      <Xmark className="size-3" />
      Withdraw
    </button>
  );
}