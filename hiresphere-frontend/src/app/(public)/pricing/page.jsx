import ButtonLink from "@/components/shared/ButtonLink";
import { PLAN_LIMITS } from "@/lib/api/jobstruture";
import {
  ArrowRight,
  Check,
  CircleQuestion,
  CrownDiamond,
  Rocket,
  Sparkles,
  Xmark,
} from "@gravity-ui/icons";
import { Card } from "@heroui/react";
import Link from "next/link";

const tiers = [
  {
    id: "free",
    name: "Free",
    tagline: "Get your first company live in minutes.",
    price: "$0",
    cadence: "forever",
    icon: Sparkles,
    highlight: false,
    features: [
      { text: `${PLAN_LIMITS.free} active job posts`, included: true },
      { text: "1 company profile", included: true },
      { text: "Public job board listing", included: true },
      { text: "Basic applicant tracking", included: true },
      { text: "Email support", included: true },
      { text: "Featured company badge", included: false },
      { text: "Custom branding", included: false },
    ],
  },
  {
    id: "growth",
    name: "Growth",
    tagline: "For growing teams hiring every month.",
    price: "$29",
    cadence: "per month",
    icon: Rocket,
    highlight: true,
    features: [
      { text: `${PLAN_LIMITS.growth} active job posts`, included: true },
      { text: "Up to 3 company profiles", included: true },
      { text: "Public job board listing", included: true },
      { text: "Applicant tracking + status", included: true },
      { text: "Priority email support", included: true },
      { text: "Featured company badge", included: true },
      { text: "Custom branding", included: false },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Scale hiring with no limits and full control.",
    price: "$99",
    cadence: "per month",
    icon: CrownDiamond,
    highlight: false,
    features: [
      { text: `${PLAN_LIMITS.enterprise} active job posts`, included: true },
      { text: "Unlimited company profiles", included: true },
      { text: "Public job board listing", included: true },
      { text: "Advanced applicant tracking", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "Featured company badge", included: true },
      { text: "Custom branding + API access", included: true },
    ],
  },
];

const faqs = [
  {
    q: "Can I switch plans later?",
    a: "Yes — upgrade or downgrade any time from your dashboard settings. Changes take effect immediately and we prorate the difference.",
  },
  {
    q: "What happens if I exceed my active job limit?",
    a: "Existing jobs keep running. New posts are blocked until you close an existing job or upgrade your plan.",
  },
  {
    q: "Do you offer a free trial of paid plans?",
    a: "Yes — every paid plan includes a 14-day free trial. No credit card required to start.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from your dashboard and your plan stays active until the end of the current billing period.",
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 lg:px-8">
      <header className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-default bg-content1 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <Sparkles className="size-3" />
          Pricing
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Plans built for every hiring stage
        </h1>
        <p className="mt-3 text-muted-foreground">
          Start free, grow when you&apos;re ready. All plans include the public job
          board and applicant tracking.
        </p>
      </header>

      <section className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
        {tiers.map((tier) => {
          const Icon = tier.icon;
          return (
            <Card
              key={tier.id}
              className={
                tier.highlight
                  ? "relative flex flex-col gap-4 rounded-2xl border border-indigo-500/60 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.18),transparent_60%),linear-gradient(180deg,#1a1c22,#0f1013)] p-6 shadow-[0_0_0_1px_rgba(99,102,241,0.2)]"
                  : "flex flex-col gap-4 rounded-2xl border border-default bg-content1 p-6"
              }
            >
              {tier.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-500 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-lg">
                  Most popular
                </span>
              )}

              <div className="flex items-center gap-3">
                <div
                  className={
                    tier.highlight
                      ? "flex size-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300"
                      : "flex size-10 items-center justify-center rounded-xl bg-default text-default-foreground"
                  }
                >
                  <Icon className="size-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">{tier.name}</h2>
                  <p className="text-xs text-muted-foreground">{tier.tagline}</p>
                </div>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold text-white">{tier.price}</span>
                <span className="text-xs text-muted-foreground">/ {tier.cadence}</span>
              </div>

              <ul className="flex flex-col gap-2 text-sm">
                {tier.features.map((feature) => (
                  <li
                    key={feature.text}
                    className="flex items-start gap-2"
                  >
                    {feature.included ? (
                      <Check className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                    ) : (
                      <Xmark className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    )}
                    <span
                      className={
                        feature.included
                          ? "text-white"
                          : "text-muted-foreground line-through"
                      }
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-2">
                <ButtonLink
                  href={
                    tier.id === "free"
                      ? "/auth/signup"
                      : `/auth/signup?plan=${tier.id}`
                  }
                  variant={tier.highlight ? "primary" : "secondary"}
                  className="w-full"
                >
                  Get started
                  <ArrowRight className="size-4" />
                </ButtonLink>
              </div>
            </Card>
          );
        })}
      </section>

      <section className="mt-16">
        <h2 className="text-center text-2xl font-semibold text-white">
          Frequently asked questions
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Can&apos;t find what you&apos;re looking for?{" "}
          <Link
            href="/dashboard/help"
            className="text-indigo-300 transition-colors hover:text-indigo-200"
          >
            Contact support
          </Link>
          .
        </p>

        <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-3 md:grid-cols-2">
          {faqs.map((item) => (
            <Card
              key={item.q}
              className="rounded-2xl border border-default bg-content1 p-5"
            >
              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-default text-indigo-300">
                  <CircleQuestion className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{item.q}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.a}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <Card className="mt-16 rounded-2xl border border-default bg-[radial-gradient(circle_at_30%_50%,rgba(99,102,241,0.18),transparent_60%),linear-gradient(180deg,#16181c,#0f1013)] p-8 text-center">
        <Sparkles className="mx-auto size-8 text-indigo-300" />
        <h2 className="mt-3 text-2xl font-semibold text-white">
          Hiring at scale?
        </h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          Enterprise customers get volume discounts, an SLA, and a dedicated
          account manager. Talk to our team.
        </p>
        <ButtonLink
          href="/dashboard/help"
          variant="secondary"
          className="mx-auto mt-4 w-fit"
        >
          Talk to sales
          <ArrowRight className="size-4" />
        </ButtonLink>
      </Card>
    </div>
  );
}
