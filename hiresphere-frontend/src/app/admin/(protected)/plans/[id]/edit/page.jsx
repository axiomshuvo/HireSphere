import { getAdminPlans } from "@/lib/actions/admin";
import AdminPlanEditForm from "./AdminPlanEditForm";

export const dynamic = "force-dynamic";

export default async function AdminPlanEditPage({ params }) {
  const { id } = await params;
  const data = await getAdminPlans().catch(() => ({ items: [] }));
  const plan = data.items?.find((p) => String(p._id) === id);
  if (!plan) return <p className="p-6">Plan not found.</p>;
  return (
    <div className="p-6">
      <AdminPlanEditForm plan={JSON.parse(JSON.stringify(plan))} />
    </div>
  );
}
