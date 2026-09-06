import AdminLoginForm from "./AdminLoginForm";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <AdminLoginForm />
    </div>
  );
}
