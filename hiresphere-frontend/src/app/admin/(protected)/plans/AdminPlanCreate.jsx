"use client";

import { Button, Input } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createAdminPlan } from "@/lib/actions/admin";
import { authToasts } from "@/lib/toast";
import { Plus } from "@gravity-ui/icons";

export default function AdminPlanCreate() {
  const router = useRouter();
  const [form, setForm] = useState({ planId: "", role: "seeker", name: "", amount: "" });
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="flex flex-col gap-4 sm:flex-row sm:items-end"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!form.planId || !form.name || form.amount === "") {
          return authToasts.error("All fields are required");
        }
        setLoading(true);
        try {
          await createAdminPlan({
            planId: form.planId,
            slug: form.planId,
            role: form.role,
            name: form.name,
            pricing: { amount: Number(form.amount), currency: "USD", cadence: "month" },
            limits: { activeJobPosts: form.role === 'recruiter' ? 3 : 0, applicationsPerMonth: 5, savedJobs: 10 },
            features: [],
            isActive: true,
          });
          authToasts.success("Plan created successfully");
          setForm({ planId: "", role: "seeker", name: "", amount: "" });
          router.refresh();
        } catch (err) {
          authToasts.error(err.message || "Failed to create plan");
        } finally {
          setLoading(false);
        }
      }}
    >
      <Input
        label="Plan ID"
        size="sm"
        placeholder="e.g. basic-tier"
        value={form.planId}
        onChange={(e) => setForm({ ...form, planId: e.target.value })}
        className="w-full sm:w-48"
      />
      
      <select
        className="h-10 w-full sm:w-32 rounded-lg border-2 border-default-200 bg-default-100 px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
        value={form.role}
        onChange={(e) => setForm({ ...form, role: e.target.value })}
      >
        <option value="seeker">Seeker</option>
        <option value="recruiter">Recruiter</option>
      </select>

      <Input
        label="Display Name"
        size="sm"
        placeholder="e.g. Basic Plan"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="w-full sm:w-64"
      />
      <Input
        label="Monthly Price ($)"
        size="sm"
        type="number"
        placeholder="0"
        value={form.amount}
        onChange={(e) => setForm({ ...form, amount: e.target.value })}
        className="w-full sm:w-32"
      />
      <Button 
        type="submit" 
        color="primary" 
        isLoading={loading}
        startContent={!loading && <Plus className="size-4" />}
      >
        Create Plan
      </Button>
    </form>
  );
}
