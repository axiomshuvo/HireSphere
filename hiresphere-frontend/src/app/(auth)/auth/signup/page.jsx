import { Suspense } from "react";
import SignUpForm from "./SignUpForm";
import Link from "next/link";
import { Sparkles, Check } from "@gravity-ui/icons";

export const dynamic = "force-dynamic";

export default function SignUp() {
  return (
    <div className="flex min-h-[90vh] w-full bg-(color-bg)">
      {/* Left side visual - Hidden on small screens */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-r border-(color-border) bg-[radial-gradient(ellipse_at_bottom_left,var(--color-surface-2),var(--color-bg))] p-12 lg:flex">
        
        {/* Glow effect */}
        <div className="absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        
        <div className="relative z-10 flex items-center gap-2">
          <Link href="/" className="flex items-center text-2xl font-bold">
            <span className="text-[#0072FF]">Hire</span>
            <span className="text-[#FF6A00]">Sphere</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <Sparkles className="size-10 mb-4 text-emerald-500/50" />
          <h2 className="mb-6 text-3xl font-medium tracking-tight text-(color-foreground)">
            Start your journey with us today.
          </h2>
          <ul className="mb-8 space-y-4 text-lg text-(color-text-muted)">
            <li className="flex items-center gap-3">
              <Check className="size-5 text-emerald-500" /> AI-powered job matching
            </li>
            <li className="flex items-center gap-3">
              <Check className="size-5 text-emerald-500" /> Premium company profiles
            </li>
            <li className="flex items-center gap-3">
              <Check className="size-5 text-emerald-500" /> Seamless application tracking
            </li>
          </ul>
        </div>
      </div>

      {/* Right side form */}
      <div className="flex w-full flex-col items-center justify-center px-4 py-12 lg:w-1/2 lg:px-8">
        <Suspense
          fallback={
            <div className="h-[600px] w-full max-w-md animate-pulse p-8">
              <div className="mb-6 space-y-1">
                <div className="h-6 w-1/2 rounded bg-(color-surface-2)" />
                <div className="h-4 w-1/3 rounded bg-(color-surface-2)" />
              </div>
              <div className="space-y-4">
                <div className="h-12 w-full rounded-xl bg-(color-surface-2)" />
                <div className="h-12 w-full rounded-xl bg-(color-surface-2)" />
                <div className="h-12 w-full rounded-xl bg-(color-surface-2)" />
              </div>
            </div>
          }
        >
          <SignUpForm />
        </Suspense>
      </div>
    </div>
  );
}
