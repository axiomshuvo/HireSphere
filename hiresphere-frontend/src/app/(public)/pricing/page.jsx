"use client";

import ButtonLink from "@/components/shared/ButtonLink";
import PlanUpgradeModal from "@/components/shared/PlanUpgradeModal";
import { getPlans } from "@/lib/actions/plans";
import { useSession } from "@/lib/auth-client";
import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleQuestion,
  CrownDiamond,
  Rocket,
  Sparkles,
  Star,
  Xmark,
} from "@gravity-ui/icons";
import { Accordion, Button, Card, toast } from "@heroui/react";
import Link from "next/link";
import { useEffect, useState } from "react";

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

function mapDbPlanToTier(plan, role) {
  const isRecruiter = role === "recruiter";
  const defaultIcon = isRecruiter
    ? plan.planId === "enterprise"
      ? CrownDiamond
      : plan.planId === "growth"
        ? Rocket
        : Sparkles
    : plan.planId === "premium"
      ? Star
      : plan.planId === "pro"
        ? Rocket
        : Sparkles;

  return {
    id: isRecruiter ? plan.planId : `seeker-${plan.planId}`,
    plan: plan.planId,
    name: plan.name,
    tagline: plan.tagline,
    price: plan.pricing?.amount === 0 ? "$0" : `$${plan.pricing?.amount}`,
    cadence: plan.pricing?.cadence || "per month",
    icon: resolveIcon(plan.ui?.icon, defaultIcon),
    highlight: plan.ui?.highlight ?? false,
    features: plan.features || [],
  };
}

/* ------------------------------------------------------------------ */
/*  FAQ accordion data                                                 */
/* ------------------------------------------------------------------ */

const faqs = [
  {
    q: "Can I switch plans later?",
    a: "Yes — upgrade or downgrade any time from your dashboard settings. Changes take effect immediately and we prorate the difference.",
    category: "Plan switching",
  },
  {
    q: "How does plan switching work mid-cycle?",
    a: "When you upgrade, you're charged the prorated difference for the rest of the billing cycle. When you downgrade, you receive a credit toward your next billing period.",
    category: "Plan switching",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from your dashboard and your plan stays active until the end of the current billing period. No penalties or hidden fees.",
    category: "Cancellation",
  },
  {
    q: "What happens to my data if I cancel?",
    a: "Your profile, applications, and saved jobs remain intact. You simply revert to the Free plan limits. You can re-subscribe at any time to unlock paid features again.",
    category: "Cancellation",
  },
  {
    q: "What is your refund policy?",
    a: "We offer a full refund within the first 14 days of any paid plan. After that, you can cancel and keep access until the end of your billing period — but no partial refunds are issued.",
    category: "Refunds",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit and debit cards (Visa, Mastercard, American Express), as well as PayPal. Enterprise customers can also pay via invoice.",
    category: "Payment methods",
  },
  {
    q: "Is my payment information secure?",
    a: "Absolutely. We use industry-standard SSL encryption and never store your card details on our servers. All payments are processed through Stripe, a PCI Level 1 certified provider.",
    category: "Payment methods",
  },
  {
    q: "What happens if I exceed my plan limits?",
    a: "Existing items stay active. New actions (job posts or applications) are blocked until you free up capacity or upgrade your plan.",
    category: "Plan limits",
  },
];

/* ------------------------------------------------------------------ */
/*  TierCard component                                                 */
/* ------------------------------------------------------------------ */

function TierCard({ tier, planParam, planRole, isLoggedIn, onGetStarted }) {
  const Icon = tier.icon;

  const buttonContent = (
    <>
      Get started
      <ArrowRight className="size-4" />
    </>
  );

  return (
    <Card
      className={
        tier.highlight
          ? "relative flex flex-col gap-4 rounded-2xl border border-indigo-500/60 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.18),transparent_60%),linear-gradient(180deg,#1a1c22,#0f1013)] p-6 shadow-[0_0_0_1px_rgba(99,102,241,0.2)]"
          : "flex flex-col gap-4 rounded-2xl border border-(color-border) bg-(color-surface) p-6"
      }
    >
      {tier.highlight && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-500 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-(color-text) shadow-lg">
          Most popular
        </span>
      )}

      <div className="flex items-center gap-3">
        <div
          className={
            tier.highlight
              ? "flex size-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300"
              : "flex size-10 items-center justify-center rounded-xl bg-(color-surface-2) text-(color-text)"
          }
        >
          <Icon className="size-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-(color-text)">
            {tier.name}
          </h2>
          <p className="text-xs text-(color-text-muted)">{tier.tagline}</p>
        </div>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-bold text-(color-text)">
          {tier.price}
        </span>
        <span className="text-xs text-(color-text-muted)">
          / {tier.cadence}
        </span>
      </div>

      <ul className="flex flex-col gap-2 text-sm">
        {tier.features.map((feature) => (
          <li key={feature.text} className="flex items-start gap-2">
            {feature.included ? (
              <Check className="mt-0.5 size-4 shrink-0 text-emerald-400" />
            ) : (
              <Xmark className="mt-0.5 size-4 shrink-0 text-(color-text-muted)" />
            )}
            <span
              className={
                feature.included
                  ? "text-(color-text)"
                  : "text-(color-text-muted) line-through"
              }
            >
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-2">
        {isLoggedIn ? (
          <Button
            variant={tier.highlight ? "primary" : "secondary"}
            className="w-full"
            onPress={() => onGetStarted?.(planParam ?? tier.id, planRole)}
          >
            {buttonContent}
          </Button>
        ) : (
          <ButtonLink
            href={
              tier.id === "free" || tier.plan === "free"
                ? "/auth/signup"
                : `/auth/signup?plan=${planParam ?? tier.id}`
            }
            variant={tier.highlight ? "primary" : "secondary"}
            className="w-full"
          >
            {buttonContent}
          </ButtonLink>
        )}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

function TierSkeleton() {
  return (
    <Card className="flex flex-col gap-4 rounded-2xl border border-(color-border) bg-(color-surface) p-6 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-xl bg-(color-surface-2)" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-24 rounded bg-(color-surface-2)" />
          <div className="h-3 w-40 rounded bg-(color-surface-2)" />
        </div>
      </div>
      <div className="h-8 w-20 rounded bg-(color-surface-2) my-2" />
      <div className="space-y-2 my-2">
        <div className="h-3 w-full rounded bg-(color-surface-2)" />
        <div className="h-3 w-4/5 rounded bg-(color-surface-2)" />
        <div className="h-3 w-3/4 rounded bg-(color-surface-2)" />
      </div>
      <div className="h-10 w-full rounded-xl bg-(color-surface-2) mt-auto" />
    </Card>
  );
}

export default function PricingPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const isLoggedIn = !!user;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPlan, setModalPlan] = useState(null);

  const [activeRecruiterTiers, setActiveRecruiterTiers] = useState([]);
  const [activeSeekerTiers, setActiveSeekerTiers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadPlans() {
      try {
        const [recruiterPlans, seekerPlans] = await Promise.all([
          getPlans("recruiter"),
          getPlans("seeker"),
        ]);
        if (!isMounted) return;
        if (recruiterPlans && recruiterPlans.length > 0) {
          setActiveRecruiterTiers(
            recruiterPlans.map((p) => mapDbPlanToTier(p, "recruiter")),
          );
        }
        if (seekerPlans && seekerPlans.length > 0) {
          setActiveSeekerTiers(
            seekerPlans.map((p) => mapDbPlanToTier(p, "seeker")),
          );
        }
      } catch (err) {
        console.warn("Error loading plans from DB:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadPlans();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleGetStarted = (planId, planRole) => {
    if (!planRole || planRole === user?.role) {
      setModalPlan(planId);
      setIsModalOpen(true);
      return;
    }

    if (planRole === "recruiter") {
      toast.info(
        "This plan is for recruiters. Switch to a recruiter account to use it.",
      );
    } else {
      toast.info(
        "This plan is for job seekers. Switch to a job seeker account to use it.",
      );
    }
  };

  const handleModalClose = (open) => {
    if (!open) {
      setModalPlan(null);
    }
    setIsModalOpen(open);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 lg:px-8">
      {/* Header */}
      <header className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-(color-border) bg-(color-surface) px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-(color-text-muted)">
          <Sparkles className="size-3" />
          Pricing
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-(color-text) sm:text-4xl">
          Plans built for every hiring stage
        </h1>
        <p className="mt-3 text-(color-text-muted)">
          Start free, grow when you&apos;re ready. All plans include the public
          job board and applicant tracking.
        </p>
      </header>

      {/* Recruiter tiers */}
      <section className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
        {isLoading ? (
          <>
            <TierSkeleton />
            <TierSkeleton />
            <TierSkeleton />
          </>
        ) : (
          activeRecruiterTiers.map((tier) => (
            <TierCard
              key={tier.id}
              tier={tier}
              planParam={tier.id}
              planRole="recruiter"
              isLoggedIn={isLoggedIn}
              onGetStarted={handleGetStarted}
            />
          ))
        )}
      </section>

      {/* Seeker tiers */}
      <section className="mt-16">
        <header className="mb-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-(color-border) bg-(color-surface) px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-(color-text-muted)">
            <Star className="size-3" />
            For job seekers
          </span>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-(color-text)">
            Plans for your job search
          </h2>
          <p className="mt-2 text-sm text-(color-text-muted)">
            Free for everyone, with Pro and Premium tiers for more applications
            and recruiter visibility.
          </p>
        </header>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {isLoading ? (
            <>
              <TierSkeleton />
              <TierSkeleton />
              <TierSkeleton />
            </>
          ) : (
            activeSeekerTiers.map((tier) => (
              <TierCard
                key={tier.id}
                tier={tier}
                planParam={tier.plan}
                planRole="seeker"
                isLoggedIn={isLoggedIn}
                onGetStarted={handleGetStarted}
              />
            ))
          )}
        </div>
      </section>

      {/* FAQ accordion */}
      <section className="mt-16">
        <h2 className="text-center text-2xl font-semibold text-(color-text)">
          Frequently asked questions
        </h2>
        <p className="mt-2 text-center text-sm text-(color-text-muted)">
          Can&apos;t find what you&apos;re looking for?{" "}
          <Link
            href="/help"
            className="text-indigo-300 transition-colors hover:text-indigo-200"
          >
            Contact support
          </Link>
          .
        </p>

        <div className="mx-auto mt-8 max-w-3xl">
          <Accordion variant="bordered">
            {faqs.map((item, index) => (
              <Accordion.Item
                key={index}
                className="border-b border-(color-border) last:border-b-0"
              >
                <Accordion.Heading>
                  <Accordion.Trigger className="group flex w-full items-center gap-3 py-4 text-left">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-(color-surface-2) text-indigo-300">
                      <CircleQuestion className="size-4" />
                    </div>
                    <span className="flex-1 text-sm font-semibold text-(color-text)">
                      {item.q}
                    </span>
                    <Accordion.Indicator>
                      <ChevronDown className="size-4 text-(color-text-muted) transition-transform duration-200" />
                    </Accordion.Indicator>
                  </Accordion.Trigger>
                </Accordion.Heading>
                <Accordion.Panel>
                  <div className="pb-4 pl-11 text-sm text-(color-text-muted)">
                    {item.a}
                  </div>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Enterprise CTA */}
      <Card className="mt-16 rounded-2xl border border-(color-border) bg-[radial-gradient(circle_at_30%_50%,rgba(99,102,241,0.18),transparent_60%),linear-gradient(180deg,#16181c,#0f1013)] p-8 text-center">
        <Sparkles className="mx-auto size-8 text-indigo-300" />
        <h2 className="mt-3 text-2xl font-semibold text-(color-text)">
          Hiring at scale?
        </h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-(color-text-muted)">
          Enterprise customers get volume discounts, an SLA, and a dedicated
          account manager. Talk to our team.
        </p>
        <ButtonLink
          href="/help"
          variant="secondary"
          className="mx-auto mt-4 w-fit"
        >
          Talk to sales
          <ArrowRight className="size-4" />
        </ButtonLink>
      </Card>

      <PlanUpgradeModal
        isOpen={isModalOpen}
        onOpenChange={handleModalClose}
        role={user?.role}
        currentPlan={user?.plan}
        defaultSelectedPlan={modalPlan}
      />
    </div>
  );
}
