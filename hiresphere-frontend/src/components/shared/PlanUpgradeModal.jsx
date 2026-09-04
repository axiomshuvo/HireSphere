"use client";

import { getPlans } from "@/lib/actions/plans";
import { updateProfilePlan } from "@/lib/actions/profile";
import { useSession } from "@/lib/auth-client";
import {
  ArrowChevronLeft,
  ArrowRight,
  Check,
  CrownDiamond,
  Rocket,
  Sparkles,
  Star,
  Xmark,
} from "@gravity-ui/icons";
import {
  Button,
  Modal,
  toast,
  Typography,
  useOverlayState,
} from "@heroui/react";
import { useCallback, useEffect, useState, useTransition } from "react";

const ICON_MAP = {
  sparkles: Sparkles,
  rocket: Rocket,
  star: Star,
  crown: CrownDiamond,
};

function resolveIcon(iconName, defaultIcon = Sparkles) {
  if (!iconName) return defaultIcon;
  return ICON_MAP[String(iconName).toLowerCase()] || defaultIcon;
}

/* ------------------------------------------------------------------ */
/*  Plan tiers                                                         */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function PlanUpgradeModal({
  role,
  currentPlan,
  isOpen,
  onOpenChange,
  defaultSelectedPlan,
}) {
  const { data: session } = useSession();
  const [step, setStep] = useState("select");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isPending, startTransition] = useTransition();

  const handleOpenChange = (open) => {
    if (!open) {
      setStep("select");
      setSelectedPlan(null);
    }
    onOpenChange?.(open);
  };

  const state = useOverlayState({ isOpen, onOpenChange: handleOpenChange });

  const userRole = role ?? session?.user?.role ?? "seeker";
  const userCurrentPlan = currentPlan ?? session?.user?.plan ?? "free";
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchDbPlans() {
      setIsLoading(true);
      try {
        const dbData = await getPlans(userRole);
        if (!isMounted || !dbData || dbData.length === 0) return;
        const mapped = dbData.map((p) => {
          const defaultIcon =
            userRole === "recruiter"
              ? p.planId === "enterprise"
                ? CrownDiamond
                : p.planId === "growth"
                  ? Rocket
                  : Sparkles
              : p.planId === "premium"
                ? Star
                : p.planId === "pro"
                  ? Rocket
                  : Sparkles;

          return {
            id: p.planId || p.id,
            name: p.name,
            tagline: p.tagline,
            price: p.pricing?.amount === 0 ? "$0" : `$${p.pricing?.amount}`,
            cadence: p.pricing?.cadence || "per month",
            icon: resolveIcon(p.ui?.icon, defaultIcon),
            highlight: p.ui?.highlight ?? false,
            tierOrder: p.tierOrder,
            features: p.features || [],
          };
        });
        setPlans(mapped);
      } catch (err) {
        console.warn("Error loading plans from DB in modal:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    if (state.isOpen) {
      fetchDbPlans();
    }
    return () => {
      isMounted = false;
    };
  }, [state.isOpen, userRole]);

  const getPlanRank = useCallback(
    (planObjOrId) => {
      if (!planObjOrId) return 0;
      if (
        typeof planObjOrId === "object" &&
        planObjOrId.tierOrder !== undefined
      ) {
        return planObjOrId.tierOrder;
      }
      const id = typeof planObjOrId === "object" ? planObjOrId.id : planObjOrId;
      const found = plans.find((p) => p.id === id);
      if (found?.tierOrder !== undefined) return found.tierOrder;
      const index = plans.findIndex((p) => p.id === id);
      return index >= 0 ? index : 0;
    },
    [plans],
  );

  const currentRank = getPlanRank(userCurrentPlan);

  // Auto-advance to confirmation when opened from pricing page
  useEffect(() => {
    if (state.isOpen && defaultSelectedPlan) {
      startTransition(() => {
        const plan = plans.find((p) => p.id === defaultSelectedPlan);
        if (plan && getPlanRank(plan) > currentRank) {
          setSelectedPlan(plan);
          setStep("confirm");
        } else {
          setStep("select");
        }
      });
    }
  }, [state.isOpen, defaultSelectedPlan, plans, currentRank, getPlanRank]);

  const handlePlanSelect = (plan) => {
    const planRank = getPlanRank(plan);
    if (planRank < currentRank) return;
    setSelectedPlan(plan);
    setStep("confirm");
  };

  const handleBack = () => {
    setStep("select");
    setSelectedPlan(null);
  };

  const handleConfirm = () => {
    if (!selectedPlan) return;
    startTransition(async () => {
      try {
        const res = await fetch("/api/checkout_sessions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ plan: selectedPlan.id }),
        });

        const data = await res.json();
        if (data?.url) {
          window.location.href = data.url;
          return;
        }

        // Fallback to direct plan update
        await updateProfilePlan(selectedPlan.id);
        toast.success("Plan updated", {
          description: `You are now on the ${selectedPlan.name} plan.`,
        });
        state.close();
      } catch (err) {
        toast.danger("Upgrade failed", {
          description:
            err?.message ?? "Could not initiate checkout. Please try again.",
        });
      }
    });
  };

  /* -------------------------------------------------------------- */
  /*  Render                                                          */
  /* -------------------------------------------------------------- */

  const selectedPlanData = plans.find((p) => p.id === userCurrentPlan);
  const currentPlanName = selectedPlanData?.name ?? "Free";

  return (
    <Modal state={state}>
      <Modal.Backdrop variant="blur">
        <Modal.Container placement="center" size="2xl">
          <Modal.Dialog>
            <Modal.CloseTrigger />

            {/* Header */}
            <Modal.Header className="flex-col gap-1 pb-4">
              <Modal.Heading className="flex items-center gap-2 text-2xl font-bold">
                {step === "select" ? (
                  <>
                    <Sparkles className="size-6 text-indigo-500" />
                    Upgrade Your Plan
                  </>
                ) : (
                  <>
                    <Check className="size-6 text-emerald-400" />
                    Confirm Upgrade
                  </>
                )}
              </Modal.Heading>
              {step === "select" && (
                <Typography.Paragraph className="text-sm text-default-500">
                  Choose a plan to unlock more features. Payment integration is
                  coming soon — plan switches take effect immediately.
                </Typography.Paragraph>
              )}
            </Modal.Header>

            {/* Body */}
            <Modal.Body>
              {step === "select" && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3 p-2 pt-4">
                  {isLoading || plans.length === 0 ? (
                    <>
                      <div className="flex h-80 flex-col gap-4 rounded-2xl border border-default-200 bg-content1 p-6 animate-pulse" />
                      <div className="flex h-80 flex-col gap-4 rounded-2xl border border-default-200 bg-content1 p-6 animate-pulse" />
                      <div className="flex h-80 flex-col gap-4 rounded-2xl border border-default-200 bg-content1 p-6 animate-pulse" />
                    </>
                  ) : (
                    plans.map((plan) => {
                      const planRank = getPlanRank(plan);
                      const isCurrent = plan.id === userCurrentPlan;
                      const isDowngrade = planRank < currentRank;
                      const isSelected = selectedPlan?.id === plan.id;
                      const Icon = plan.icon;

                      return (
                        <div
                          key={plan.id}
                          onClick={() => {
                            if (!isDowngrade && !isCurrent)
                              handlePlanSelect(plan);
                          }}
                          className={
                            isDowngrade
                              ? "relative flex flex-col gap-4 rounded-2xl border border-default-200 bg-default-100/50 p-6 cursor-not-allowed grayscale-[50%]"
                              : isCurrent
                                ? "relative flex flex-col gap-4 rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-b from-emerald-500/10 to-transparent p-6 cursor-default shadow-[0_0_20px_rgba(16,185,129,0.05)]"
                                : isSelected
                                  ? "relative flex flex-col gap-4 rounded-2xl border-2 border-indigo-500 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.22),transparent_60%),linear-gradient(180deg,#1a1c22,#0f1013)] p-6 shadow-[0_0_15px_rgba(99,102,241,0.2)] cursor-pointer transition-all -translate-y-1"
                                  : plan.highlight
                                    ? "relative flex flex-col gap-4 rounded-2xl border border-indigo-500/50 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.12),transparent_60%),linear-gradient(180deg,#1a1c22,#0f1013)] p-6 shadow-lg cursor-pointer transition-all hover:-translate-y-1 hover:border-indigo-400 hover:shadow-[0_0_15px_rgba(99,102,241,0.15)] group"
                                    : "relative flex flex-col gap-4 rounded-2xl border border-default-200 bg-content1 p-6 cursor-pointer transition-all hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-lg group"
                          }
                        >
                          {isDowngrade && (
                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-default-200 bg-default-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-default-500">
                              Included
                            </span>
                          )}
                          {isCurrent && (
                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-lg">
                              Current plan
                            </span>
                          )}
                          {plan.highlight &&
                            !isCurrent &&
                            !isSelected &&
                            !isDowngrade && (
                              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-500 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-lg">
                                Most popular
                              </span>
                            )}
                          {isSelected && (
                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-500 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-[0_0_0_2px_rgba(99,102,241,0.5)]">
                              Selected
                            </span>
                          )}

                          <div className="flex items-center gap-3">
                            <div
                              className={
                                isSelected ||
                                (plan.highlight && !isDowngrade && !isCurrent)
                                  ? "flex size-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-500 transition-colors group-hover:bg-indigo-500/30"
                                  : isCurrent
                                    ? "flex size-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400"
                                    : "flex size-10 items-center justify-center rounded-xl bg-default-100 text-foreground transition-colors group-hover:bg-indigo-500/10 group-hover:text-indigo-500"
                              }
                            >
                              <Icon className="size-5" />
                            </div>
                            <div>
                              <h2
                                className={
                                  isDowngrade
                                    ? "text-lg font-semibold text-default-500"
                                    : "text-lg font-semibold text-foreground"
                                }
                              >
                                {plan.name}
                              </h2>
                              {plan.tagline && (
                                <p className="text-xs text-default-500">
                                  {plan.tagline}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-baseline gap-1.5">
                            <span
                              className={
                                isDowngrade
                                  ? "text-3xl font-bold text-default-500"
                                  : "text-3xl font-bold text-foreground"
                              }
                            >
                              {plan.price}
                            </span>
                            <span className="text-xs text-default-500">
                              / {plan.cadence}
                            </span>
                          </div>

                          <ul className="flex flex-col gap-3 text-sm mt-2">
                            {plan.features.map((feature) => (
                              <li
                                key={feature.text}
                                className="flex items-start gap-2"
                              >
                                {feature.included ? (
                                  <Check
                                    className={
                                      isDowngrade
                                        ? "mt-0.5 size-4 shrink-0 text-default-500/50"
                                        : isCurrent
                                          ? "mt-0.5 size-4 shrink-0 text-emerald-400"
                                          : "mt-0.5 size-4 shrink-0 text-indigo-500"
                                    }
                                  />
                                ) : (
                                  <Xmark className="mt-0.5 size-4 shrink-0 text-default-500/30" />
                                )}
                                <span
                                  className={
                                    feature.included
                                      ? isDowngrade
                                        ? "text-default-500"
                                        : "text-foreground"
                                      : "text-default-500/50 line-through"
                                  }
                                >
                                  {feature.text}
                                </span>
                              </li>
                            ))}
                          </ul>

                          <div className="mt-auto pt-4">
                            {isCurrent ? (
                              <Button
                                variant="flat"
                                className="w-full bg-emerald-500/10 text-emerald-400 font-medium"
                                isDisabled
                              >
                                Current plan
                              </Button>
                            ) : isDowngrade ? (
                              <Button
                                variant="flat"
                                className="w-full bg-default-100 text-default-500"
                                isDisabled
                              >
                                Included in {currentPlanName}
                              </Button>
                            ) : (
                              <Button
                                variant={
                                  plan.highlight || isSelected
                                    ? "solid"
                                    : "bordered"
                                }
                                color={
                                  plan.highlight || isSelected
                                    ? "primary"
                                    : "default"
                                }
                                className={
                                  plan.highlight || isSelected
                                    ? "w-full bg-indigo-500 text-white shadow-md hover:bg-indigo-600 font-medium"
                                    : "w-full border-default-200 hover:border-indigo-500 hover:text-indigo-500 font-medium transition-colors"
                                }
                                onPress={() => handlePlanSelect(plan)}
                              >
                                {isSelected ? "Selected" : "Select plan"}
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {step === "confirm" && selectedPlan && (
                <div className="flex flex-col gap-6 py-2">
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex flex-col items-center gap-1 rounded-xl border border-default-200 bg-default-100 px-6 py-4 shadow-sm">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-default-500">
                        Current
                      </span>
                      <span className="text-lg font-bold text-foreground">
                        {currentPlanName}
                      </span>
                    </div>

                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-500">
                      <ArrowRight className="size-5" />
                    </div>

                    <div className="flex flex-col items-center gap-1 rounded-xl border-2 border-indigo-500 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.15),transparent_60%),linear-gradient(180deg,#1a1c22,#0f1013)] px-6 py-4 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-500">
                        New Plan
                      </span>
                      <span className="text-lg font-bold text-indigo-100">
                        {selectedPlan.name}
                      </span>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-default-500">
                      {selectedPlan.tagline}
                    </p>
                  </div>

                  <div className="mx-auto flex items-center gap-2 rounded-full border border-default-200 bg-content1 px-5 py-2 shadow-sm">
                    <span className="text-sm font-bold text-foreground">
                      {selectedPlan.price}
                    </span>
                    <span className="text-xs text-default-500">
                      / {selectedPlan.cadence}
                    </span>
                  </div>

                  <div className="space-y-4 rounded-2xl border border-default-200 bg-content1 p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-default-500">
                      What you unlock with {selectedPlan.name}:
                    </p>
                    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {selectedPlan.features
                        .filter((f) => f.included)
                        .slice(0, 6)
                        .map((feature) => (
                          <li
                            key={feature.text}
                            className="flex items-start gap-2"
                          >
                            <Check className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                            <span className="text-sm text-foreground">
                              {feature.text}
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 px-4 py-3 text-sm text-default-500">
                    <span className="font-medium text-indigo-500">
                      Heads up:
                    </span>{" "}
                    Payment integration is coming soon. Your {selectedPlan.name}{" "}
                    plan will activate immediately for free.
                  </div>
                </div>
              )}
            </Modal.Body>

            {/* Footer */}
            <Modal.Footer>
              {step === "select" ? (
                <Button
                  variant="flat"
                  onPress={state.close}
                  className="w-full sm:w-auto bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                >
                  Cancel
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  onPress={handleBack}
                  className="w-full sm:w-auto"
                >
                  <ArrowChevronLeft className="size-4" />
                  Back
                </Button>
              )}
              {step === "confirm" && (
                <Button
                  variant="primary"
                  onPress={handleConfirm}
                  isDisabled={isPending}
                  className="w-full sm:w-auto"
                >
                  {isPending ? "Upgrading…" : "Confirm Upgrade"}
                  {!isPending && <ArrowRight className="size-4" />}
                </Button>
              )}
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
