import { getCurrentUser } from "@/lib/core/session";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

const PLAN_CATALOG = {
  pro: {
    name: "Seeker Pro",
    priceId: process.env.STRIPE_PRICE_SEEKER_PRO,
    amount: 1900, // $19.00 USD
    interval: "month",
    description:
      "Apply up to 30 jobs per month, unlimited saved jobs, and salary insights.",
  },
  premium: {
    name: "Seeker Premium",
    priceId: process.env.STRIPE_PRICE_SEEKER_PREMIUM,
    amount: 3900, // $39.00 USD
    interval: "month",
    description:
      "Unlimited applications, early access to new jobs, and profile boost.",
  },
  growth: {
    name: "Recruiter Growth",
    priceId: process.env.STRIPE_PRICE_RECRUITER_GROWTH,
    amount: 4900, // $49.00 USD
    interval: "month",
    description:
      "Up to 10 active job posts, applicant tracking, and basic analytics.",
  },
  enterprise: {
    name: "Recruiter Enterprise",
    priceId: process.env.STRIPE_PRICE_RECRUITER_ENTERPRISE,
    amount: 14900, // $149.00 USD
    interval: "month",
    description:
      "Up to 50 active job posts, advanced analytics dashboard, custom branding, and team access.",
  },
};

export async function POST(request) {
  try {
    const headersList = await headers();
    const origin =
      headersList.get("origin") ||
      headersList.get("referer") ||
      "http://localhost:3000";
    const user = await getCurrentUser();

    let planId = "pro";
    const contentType = headersList.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await request.json().catch(() => ({}));
      planId = body.plan || planId;
    } else if (
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data")
    ) {
      const formData = await request.formData().catch(() => new FormData());
      planId = formData.get("plan") || planId;
    }

    const normalizedPlan = String(planId).toLowerCase().trim();
    const catalogItem = PLAN_CATALOG[normalizedPlan];

    if (!catalogItem) {
      return NextResponse.json(
        { error: `Invalid plan specified: ${planId}` },
        { status: 400 },
      );
    }

    // Determine line item: Use pre-created Stripe Price ID if available, otherwise use price_data
    const lineItem = catalogItem.priceId
      ? {
          price: catalogItem.priceId,
          quantity: 1,
        }
      : {
          price_data: {
            currency: "usd",
            product_data: {
              name: catalogItem.name,
              description: catalogItem.description,
            },
            unit_amount: catalogItem.amount,
            recurring: {
              interval: catalogItem.interval,
            },
          },
          quantity: 1,
        };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [lineItem],
      mode: "subscription",
      customer_email: user?.email || undefined,
      client_reference_id: user?.id || undefined,
      metadata: {
        userId: user?.id || "",
        plan: normalizedPlan,
      },
      success_url: `${origin}/pricing/success?session_id={CHECKOUT_SESSION_ID}&plan=${normalizedPlan}`,
      cancel_url: `${origin}/pricing`,
    });

    if (contentType.includes("application/json")) {
      return NextResponse.json({ url: session.url });
    }

    return NextResponse.redirect(session.url, 303);
  } catch (err) {
    console.error("Stripe Checkout Session Error:", err);
    return NextResponse.json(
      { error: err.message },
      { status: err.statusCode || 500 },
    );
  }
}
