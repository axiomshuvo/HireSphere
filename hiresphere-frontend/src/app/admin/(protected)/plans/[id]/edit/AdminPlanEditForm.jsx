"use client";

import { Button, toast } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateAdminPlan } from "@/lib/actions/admin";

export default function AdminPlanEditForm({ plan }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: plan.name ?? "",
    amount: plan.pricing?.amount ?? 0,
    cadence: plan.pricing?.cadence ?? "per month",
    stripePriceId: plan.pricing?.stripePriceId ?? "",
    activeJobPosts: plan.limits?.activeJobPosts ?? 0,
    applicationsPerMonth: plan.limits?.applicationsPerMonth ?? 0,
    savedJobs: plan.limits?.savedJobs ?? 0,
    isActive: plan.isActive !== false,
  });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  return (
    <form
      className="max-w-xl space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
          await updateAdminPlan(String(plan._id), {
            name: form.name,
            pricing: {
              amount: Number(form.amount),
              amountInCents: Math.round(Number(form.amount) * 100),
              currency: "USD",
              cadence: form.cadence,
              stripePriceId: form.stripePriceId || null,
            },
            limits: {
              activeJobPosts: Number(form.activeJobPosts),
              applicationsPerMonth: Number(form.applicationsPerMonth),
              savedJobs: Number(form.savedJobs),
            },
            isActive: form.isActive,
          });
          toast.success("Plan updated");
          router.push("/admin/plans");
        } catch (err) {
          toast.error(err.message);
        } finally {
          setLoading(false);
        }
      }}
    >
      <h1 className="text-xl font-bold">Edit plan: {plan.planId}</h1>
      <input className="w-full rounded-lg border px-3 py-2 text-sm" value={form.name} onChange={set("name")} placeholder="Name" />
      <div className="grid grid-cols-2 gap-2">
        <input className="rounded-lg border px-3 py-2 text-sm" type="number" value={form.amount} onChange={set("amount")} placeholder="Amount" />
        <input className="rounded-lg border px-3 py-2 text-sm" value={form.cadence} onChange={set("cadence")} placeholder="Cadence" />
      </div>
      <input className="w-full rounded-lg border px-3 py-2 text-sm" value={form.stripePriceId} onChange={set("stripePriceId")} placeholder="Stripe price ID" />
      <div className="grid grid-cols-3 gap-2">
        <input className="rounded-lg border px-3 py-2 text-sm" type="number" value={form.activeJobPosts} onChange={set("activeJobPosts")} placeholder="Job posts (-1 = unlimited)" />
        <input className="rounded-lg border px-3 py-2 text-sm" type="number" value={form.applicationsPerMonth} onChange={set("applicationsPerMonth")} placeholder="Apps/mo" />
        <input className="rounded-lg border px-3 py-2 text-sm" type="number" value={form.savedJobs} onChange={set("savedJobs")} placeholder="Saved" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.isActive} onChange={set("isActive")} /> Visible on pricing page
      </label>
      <Button type="submit" color="primary" disabled={loading}>
        Save plan
      </Button>
    </form>
  );
}
