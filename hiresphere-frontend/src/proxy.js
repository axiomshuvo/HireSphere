import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const RECRUITER_PREFIXES = ["/dashboard/mycompany", "/dashboard/recruiter"];
const SEEKER_PREFIXES = ["/dashboard/saved-jobs", "/dashboard/applications"];

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  const session = await auth.api.getSession({
    headers: request.headers,
  });
  const user = session?.user ?? null;

  if (!user && pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/signin";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (
    user &&
    user.role !== "recruiter" &&
    RECRUITER_PREFIXES.some((p) => pathname.startsWith(p))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.searchParams.set("denied", "1");
    return NextResponse.redirect(url);
  }

  if (
    user &&
    user.role !== "seeker" &&
    SEEKER_PREFIXES.some((p) => pathname.startsWith(p))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.searchParams.set("denied", "1");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
