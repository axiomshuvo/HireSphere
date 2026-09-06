import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardRedirect() {
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session?.user) {
    redirect("/auth/signin");
  }

  if (session.user.role === "recruiter") {
    redirect("/recruiter");
  } else if (session.user.role === "admin" || session.user.role === "mod") {
    redirect("/admin");
  } else {
    // Default to seeker
    redirect("/seeker");
  }
}
