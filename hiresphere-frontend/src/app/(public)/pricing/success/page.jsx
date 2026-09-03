import { updateProfilePlan } from "@/lib/actions/profile";
import { stripe } from "@/lib/stripe";
import { ArrowRight, Check } from "@gravity-ui/icons";
import { Button } from "@heroui/react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Success({ searchParams }) {
  const params = await searchParams;
  const session_id = params?.session_id;

  if (!session_id) {
    return redirect("/pricing");
  }

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["line_items", "payment_intent"],
    });
  } catch (err) {
    console.error("Failed to retrieve checkout session:", err);
    return redirect("/pricing");
  }

  const status = session?.status;
  const customerEmail = session?.customer_details?.email;
  const plan = session?.metadata?.plan || params?.plan;

  if (status === "open") {
    return redirect("/");
  }

  // Update user plan if available
  if (status === "complete" && plan) {
    try {
      await updateProfilePlan(plan);
    } catch (e) {
      console.warn(
        "Could not automatically update user profile plan:",
        e?.message,
      );
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <div className="relative mb-6 flex size-20 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-400 ring-8 ring-emerald-500/5">
        <Check className="size-10" />
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-(color-text) sm:text-4xl">
        Payment Successful!
      </h1>
      <p className="mt-3 text-base text-(color-text-muted)">
        We appreciate your business! A confirmation email will be sent to{" "}
        <span className="font-semibold text-(color-text)">{customerEmail}</span>
        .
        {plan && (
          <span className="block mt-1">
            Your subscription to the{" "}
            <strong className="uppercase text-indigo-400">{plan}</strong> plan
            is now active.
          </span>
        )}
      </p>

      <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
        <Link href="/dashboard" className="flex-1">
          <Button
            variant="solid"
            className="w-full bg-indigo-500 font-medium text-white hover:bg-indigo-600"
          >
            Go to Dashboard
            <ArrowRight className="size-4" />
          </Button>
        </Link>
        <Link href="/dashboard/profile" className="flex-1">
          <Button
            variant="bordered"
            className="w-full border-(color-border) font-medium"
          >
            View Profile
          </Button>
        </Link>
      </div>
    </div>
  );
}
