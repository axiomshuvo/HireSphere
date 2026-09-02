"use client";

import { updateProfilePlan } from "@/lib/actions/profile";
import {
  Recruiter_PLAN_LIMITS,
  SEEKER_PLAN_LIMITS,
  SEEKER_SAVED_JOBS_LIMITS,
} from "@/lib/api/jobstruture";
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
import { useEffect, useState, useTransition } from "react";

/* ------------------------------------------------------------------ */
/*  Plan tiers                                                         */
/* ------------------------------------------------------------------ */

const SEEKER_PLANS = [
  {
    id: "free",
    name: "Free",
    tagline: "Apply to roles and save your favorites.",
    price: "$0",
    cadence: "per month",
    icon: Sparkles,
    highlight: false,
    features: [
      {
        text: `Apply to up to ${SEEKER_PLAN_LIMITS.free} jobs per month`,
        included: true,
      },
      {
        text: `Browse & save up to ${SEEKER_SAVED_JOBS_LIMITS.free} jobs`,
        included: true,
      },
      { text: "Basic profile", included: true },
      { text: "Email alerts", included: true },
      { text: "Application tracking", included: false },
      { text: "Salary insights", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Apply more and track every opportunity.",
    price: "$19",
    cadence: "per month",
    icon: Rocket,
    highlight: true,
    features: [
      {
        text: `Apply to up to ${SEEKER_PLAN_LIMITS.pro} jobs per month`,
        included: true,
      },
      { text: "Unlimited saved jobs", included: true },
      { text: "Application tracking", included: true },
      { text: "Salary insights", included: true },
      { text: "Enhanced profile", included: true },
      { text: "Profile boost to recruiters", included: false },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "Stand out and apply without limits.",
    price: "$39",
    cadence: "per month",
    icon: Star,
    highlight: false,
    features: [
      { text: "Unlimited applications", included: true },
      { text: "Unlimited saved jobs", included: true },
      { text: "Application tracking", included: true },
      { text: "Salary insights", included: true },
      { text: "Profile boost to recruiters", included: true },
      { text: "Early access to new jobs", included: true },
      { text: "Priority support", included: true },
    ],
  },
];

const RECRUITER_PLANS = [
  {
    id: "free",
    name: "Free",
    tagline: "Great for a company's first year of hiring.",
    price: "$0",
    cadence: "per month",
    icon: Sparkles,
    highlight: false,
    features: [
      {
        text: `Up to ${Recruiter_PLAN_LIMITS.free} active job posts`,
        included: true,
      },
      { text: "Basic applicant management", included: true },
      { text: "Standard listing visibility", included: true },
      { text: "Public job board listing", included: true },
      { text: "Email support", included: true },
      { text: "Featured company badge", included: false },
      { text: "Advanced analytics dashboard", included: false },
      { text: "Custom branding", included: false },
    ],
  },
  {
    id: "growth",
    name: "Growth",
    tagline: "For growing teams hiring every month.",
    price: "$49",
    cadence: "per month",
    icon: Rocket,
    highlight: true,
    features: [
      {
        text: `Up to ${Recruiter_PLAN_LIMITS.growth} active job posts`,
        included: true,
      },
      { text: "Applicant tracking", included: true },
      { text: "Basic analytics", included: true },
      { text: "Public job board listing", included: true },
      { text: "Email support", included: true },
      { text: "Featured company badge", included: true },
      { text: "Advanced analytics dashboard", included: false },
      { text: "Custom branding", included: false },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Scale hiring with no limits and full control.",
    price: "$149",
    cadence: "per month",
    icon: CrownDiamond,
    highlight: false,
    features: [
      {
        text: `Up to ${Recruiter_PLAN_LIMITS.enterprise} active job posts`,
        included: true,
      },
      { text: "Advanced analytics dashboard", included: true },
      { text: "Featured job listings", included: true },
      { text: "Team collaboration", included: true },
      { text: "Custom branding", included: true },
      { text: "Priority support", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "API access", included: true },
    ],
  },
];

const PLAN_RANK = {
  seeker: { free: 0, pro: 1, premium: 2 },
  recruiter: { free: 0, growth: 1, enterprise: 2 },
};

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
  const plans = userRole === "recruiter" ? RECRUITER_PLANS : SEEKER_PLANS;
  const currentRank = PLAN_RANK[userRole]?.[userCurrentPlan] ?? 0;

  // Auto-advance to confirmation when opened from pricing page
  useEffect(() => {
    if (state.isOpen && defaultSelectedPlan) {
      startTransition(() => {
        const plan = plans.find((p) => p.id === defaultSelectedPlan);
        if (plan && (PLAN_RANK[userRole]?.[plan.id] ?? 0) > currentRank) {
          setSelectedPlan(plan);
          setStep("confirm");
        } else {
          setStep("select");
        }
      });
    }
  }, [state.isOpen, defaultSelectedPlan, plans, userRole, currentRank]);

  const handlePlanSelect = (plan) => {
    const planRank = PLAN_RANK[userRole]?.[plan.id] ?? 0;
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
        await updateProfilePlan(selectedPlan.id);
        toast.success("Plan updated", {
          description: `You are now on the ${selectedPlan.name} plan.`,
        });
        state.close();
      } catch (err) {
        toast.danger("Upgrade failed", {
          description:
            err?.message ?? "Could not update your plan. Please try again.",
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
                    <Sparkles className="size-6 text-indigo-400" />
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
                <Typography.Paragraph className="text-sm text-(color-text-muted)">
                  Choose a plan to unlock more features. Payment integration is
                  coming soon — plan switches take effect immediately.
                </Typography.Paragraph>
              )}
            </Modal.Header>

            {/* Body */}
            <Modal.Body>
              {step === "select" && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {plans.map((plan) => {
                    const planRank = PLAN_RANK[userRole]?.[plan.id] ?? 0;
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
                            ? "relative flex flex-col gap-4 rounded-2xl border border-(color-border) bg-(color-surface-2)/50 p-6 cursor-not-allowed grayscale-[50%]"
                            : isCurrent
                              ? "relative flex flex-col gap-4 rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-b from-emerald-500/10 to-transparent p-6 cursor-default shadow-[0_0_20px_rgba(16,185,129,0.05)]"
                              : isSelected
                                ? "relative flex flex-col gap-4 rounded-2xl border-2 border-indigo-500 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.22),transparent_60%),linear-gradient(180deg,#1a1c22,#0f1013)] p-6 shadow-[0_0_15px_rgba(99,102,241,0.2)] cursor-pointer transition-all scale-[1.02]"
                                : plan.highlight
                                  ? "relative flex flex-col gap-4 rounded-2xl border border-indigo-500/50 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.12),transparent_60%),linear-gradient(180deg,#1a1c22,#0f1013)] p-6 shadow-lg cursor-pointer transition-all hover:scale-[1.02] hover:border-indigo-400 hover:shadow-[0_0_15px_rgba(99,102,241,0.15)] group"
                                  : "relative flex flex-col gap-4 rounded-2xl border border-(color-border) bg-(color-surface) p-6 cursor-pointer transition-all hover:scale-[1.02] hover:border-indigo-500/40 group"
                        }
                      >
                        {isDowngrade && (
                          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-(color-border) bg-(color-surface-2) px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-(color-text-muted)">
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
                                ? "flex size-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 transition-colors group-hover:bg-indigo-500/30"
                                : isCurrent
                                  ? "flex size-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400"
                                  : "flex size-10 items-center justify-center rounded-xl bg-(color-surface-2) text-(color-text) transition-colors group-hover:bg-indigo-500/10 group-hover:text-indigo-400"
                            }
                          >
                            <Icon className="size-5" />
                          </div>
                          <div>
                            <h2
                              className={
                                isDowngrade
                                  ? "text-lg font-semibold text-(color-text-muted)"
                                  : "text-lg font-semibold text-(color-text)"
                              }
                            >
                              {plan.name}
                            </h2>
                            {plan.tagline && (
                              <p className="text-xs text-(color-text-muted)">
                                {plan.tagline}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-baseline gap-1.5">
                          <span
                            className={
                              isDowngrade
                                ? "text-3xl font-bold text-(color-text-muted)"
                                : "text-3xl font-bold text-(color-text)"
                            }
                          >
                            {plan.price}
                          </span>
                          <span className="text-xs text-(color-text-muted)">
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
                                      ? "mt-0.5 size-4 shrink-0 text-(color-text-muted)/50"
                                      : isCurrent
                                        ? "mt-0.5 size-4 shrink-0 text-emerald-400"
                                        : "mt-0.5 size-4 shrink-0 text-indigo-400"
                                  }
                                />
                              ) : (
                                <Xmark className="mt-0.5 size-4 shrink-0 text-(color-text-muted)/30" />
                              )}
                              <span
                                className={
                                  feature.included
                                    ? isDowngrade
                                      ? "text-(color-text-muted)"
                                      : "text-(color-text)"
                                    : "text-(color-text-muted)/50 line-through"
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
                              className="w-full bg-(color-surface-2) text-(color-text-muted)"
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
                                  : "w-full border-(color-border) hover:border-indigo-500 hover:text-indigo-400 font-medium transition-colors"
                              }
                              onPress={() => handlePlanSelect(plan)}
                            >
                              {isSelected ? "Selected" : "Select plan"}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {step === "confirm" && selectedPlan && (
                <div className="flex flex-col gap-6 py-2">
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex flex-col items-center gap-1 rounded-xl border border-(color-border) bg-(color-surface-2) px-6 py-4 shadow-sm">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-(color-text-muted)">
                        Current
                      </span>
                      <span className="text-lg font-bold text-(color-text)">
                        {currentPlanName}
                      </span>
                    </div>

                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400">
                      <ArrowRight className="size-5" />
                    </div>

                    <div className="flex flex-col items-center gap-1 rounded-xl border-2 border-indigo-500 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.15),transparent_60%),linear-gradient(180deg,#1a1c22,#0f1013)] px-6 py-4 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-300">
                        New Plan
                      </span>
                      <span className="text-lg font-bold text-indigo-100">
                        {selectedPlan.name}
                      </span>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-(color-text-muted)">
                      {selectedPlan.tagline}
                    </p>
                  </div>

                  <div className="mx-auto flex items-center gap-2 rounded-full border border-(color-border) bg-(color-surface) px-5 py-2 shadow-sm">
                    <span className="text-sm font-bold text-(color-text)">
                      {selectedPlan.price}
                    </span>
                    <span className="text-xs text-(color-text-muted)">
                      / {selectedPlan.cadence}
                    </span>
                  </div>

                  <div className="space-y-4 rounded-2xl border border-(color-border) bg-(color-surface) p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-(color-text-muted)">
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
                            <span className="text-sm text-(color-text)">
                              {feature.text}
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 px-4 py-3 text-sm text-(color-text-muted)">
                    <span className="font-medium text-indigo-300">
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
