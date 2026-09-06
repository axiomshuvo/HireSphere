"use client";

import { Button, toast } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { overrideAdminUserPlan } from "@/lib/actions/admin";

export default function AdminPlanOverride({ id, currentPlan }) {
  const router = useRouter();
  const [plan, setPlan] = useState(currentPlan);
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="flex flex-wrap items-end gap-2 rounded-xl border p-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
          await overrideAdminUserPlan(id, plan);
          toast.success("Plan overridden");
          router.refresh();
        } catch (err) {
          toast.error(err.message);
        } finally {
          setLoading(false);
        }
      }}
    >
      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="plan">
          Override plan (admin only)
        </label>
        <input
          id="plan"
          className="rounded-lg border px-3 py-2 text-sm"
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
        />
      </div>
      <Button type="submit" size="sm" color="primary" disabled={loading}>
        Save plan
      </Button>
    </form>
  );
}
