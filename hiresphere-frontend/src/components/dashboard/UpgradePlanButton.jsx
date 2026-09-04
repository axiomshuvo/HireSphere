"use client";

import PlanUpgradeModal from "@/components/shared/PlanUpgradeModal";
import { useSession } from "@/lib/auth-client";
import { Rocket, Sparkles } from "@gravity-ui/icons";
import { Button } from "@heroui/react";
import { useState } from "react";

export default function UpgradePlanButton({
  role,
  currentPlan,
  className = "",
  size = "md",
  variant = "primary",
}) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const userRole = role ?? session?.user?.role ?? "seeker";
  const userPlan = currentPlan ?? session?.user?.plan ?? "free";

  const isHighestTier =
    (userRole === "seeker" && userPlan === "premium") ||
    (userRole === "recruiter" && userPlan === "enterprise");

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onPress={() => setIsOpen(true)}
        className={`cursor-pointer font-medium shadow-sm transition-all duration-200 ${
          variant === "primary"
            ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-foreground hover:from-indigo-600 hover:to-indigo-700"
            : ""
        } ${className}`}
      >
        {isHighestTier ? (
          <>
            <Sparkles className="size-4 text-amber-500" />
            <span>Manage Plan</span>
          </>
        ) : (
          <>
            <Rocket className="size-4 text-indigo-200" />
            <span>Upgrade Plan</span>
          </>
        )}
      </Button>

      <PlanUpgradeModal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        role={userRole}
        currentPlan={userPlan}
      />
    </>
  );
}
