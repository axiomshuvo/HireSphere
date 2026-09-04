import { getPlans } from "@/lib/actions/plans";
import { getCurrentUser } from "@/lib/core/session";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

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

    // Fetch all plans from DB to find the requested plan
    const allPlans = (await getPlans()) || [];
    const dbPlan = allPlans.find(
      (p) => p.planId === normalizedPlan || p.id === normalizedPlan,
    );

    if (!dbPlan || normalizedPlan === "free") {
      return NextResponse.json(
        { error: `Invalid or free plan specified: ${planId}` },
        { status: 400 },
      );
    }

    // Parse the cadence for Stripe (e.g. "per month" -> "month", "per year" -> "year")
    let stripeInterval = "month";
    if (dbPlan.pricing?.cadence?.toLowerCase().includes("year")) {
      stripeInterval = "year";
    }

    // Determine line item: Use pre-created Stripe Price ID if available, otherwise use price_data
    const stripePriceId = dbPlan.pricing?.stripePriceId;
    const lineItem = stripePriceId
      ? {
          price: stripePriceId,
          quantity: 1,
        }
      : {
          price_data: {
            currency: dbPlan.pricing?.currency?.toLowerCase() || "usd",
            product_data: {
              name: dbPlan.name,
              description: dbPlan.tagline || "",
            },
            unit_amount:
              dbPlan.pricing?.amountInCents ??
              dbPlan.pricing?.amount * 100 ??
              0,
            recurring: {
              interval: stripeInterval,
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
        planId: normalizedPlan,
      },
      subscription_data: {
        metadata: {
          userId: user?.id || "",
          planId: normalizedPlan,
        },
      },
      success_url: `${origin}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
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
