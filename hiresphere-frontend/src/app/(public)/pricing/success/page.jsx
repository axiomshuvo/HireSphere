import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { ArrowRight, Check, Sparkles } from "@gravity-ui/icons";
import { Button } from "@heroui/react";
import { headers } from "next/headers";
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

  // Delegate DB updates to the backend
  if (status === "complete" && session_id) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const reqHeaders = await headers();
      const authSession = await auth.api.getSession({ headers: reqHeaders });

      if (authSession?.user) {
        await fetch(`${baseUrl}/api/my/subscriptions/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-recruiter-id": authSession.user.id,
          },
          body: JSON.stringify({ sessionId: session_id }),
        });
      }
    } catch (e) {
      console.warn(
        "Could not automatically update user profile plan:",
        e?.message,
      );
    }
  }

  return (
    <div className="relative flex min-h-[80vh] flex-col items-center justify-center px-4 py-16">
      {/* Background glow */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/20 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-xl text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="relative flex flex-col items-center overflow-hidden rounded-3xl border border-(color-border) bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.1),transparent_60%),linear-gradient(180deg,var(--color-surface-2),var(--color-surface))] p-8 shadow-2xl backdrop-blur-xl sm:p-12">
          {/* Top glow line */}
          <div className="absolute top-0 h-1 w-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />

          <div className="relative mb-8 flex size-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 ring-8 ring-emerald-500/10">
            <Check className="size-10" />
          </div>

          <h1 className="mb-4 text-3xl font-bold tracking-tight text-(color-text) sm:text-4xl">
            Payment Successful!
          </h1>

          <p className="mb-8 text-base text-(color-text-muted)">
            We appreciate your business! A confirmation receipt has been sent to{" "}
            <span className="font-semibold text-(color-text)">
              {customerEmail}
            </span>
            .
          </p>

          {plan && (
            <div className="mb-8 w-full rounded-2xl border border-indigo-500/20 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.15),transparent_60%),linear-gradient(180deg,#1a1c22,#0f1013)] p-6 shadow-inner">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-2">
                New Plan Activated
              </span>
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="size-5 text-indigo-400" />
                <span className="text-xl font-bold text-indigo-100 capitalize">
                  {plan.replace(/_/g, " ")}
                </span>
                <Sparkles className="size-5 text-indigo-400" />
              </div>
            </div>
          )}

          <div className="flex w-full flex-col gap-3 sm:flex-row">
            <Link href="/dashboard" className="flex-1">
              <Button
                variant="solid"
                size="lg"
                className="w-full bg-indigo-500 font-medium text-white shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:bg-indigo-600 transition-all"
              >
                Go to Dashboard
                <ArrowRight className="size-5" />
              </Button>
            </Link>
            <Link href="/dashboard/profile" className="flex-1">
              <Button
                variant="bordered"
                size="lg"
                className="w-full border-(color-border) font-medium bg-(color-surface) hover:border-indigo-500/50 hover:text-indigo-400 transition-all"
              >
                View Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
