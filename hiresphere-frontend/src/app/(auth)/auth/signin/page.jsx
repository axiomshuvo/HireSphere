import { Suspense } from "react";
import SignInForm from "./SignInForm";
import Link from "next/link";
import { Sparkles } from "@gravity-ui/icons";

export const dynamic = "force-dynamic";

export default function SignIn() {
  return (
    <div className="flex min-h-[90vh] w-full bg-(color-bg)">
      {/* Left side visual - Hidden on small screens */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-r border-(color-border) bg-[radial-gradient(ellipse_at_top_right,var(--color-surface-2),var(--color-bg))] p-12 lg:flex">
        
        {/* Glow effect */}
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
        
        <div className="relative z-10 flex items-center gap-2">
          <Link href="/" className="flex items-center text-2xl font-bold">
            <span className="text-[#0072FF]">Hire</span>
            <span className="text-[#FF6A00]">Sphere</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <Sparkles className="size-10 mb-4 text-indigo-500/50" />
          <h2 className="mb-6 text-3xl font-medium tracking-tight text-(color-foreground)">
            Finding top talent shouldn&apos;t feel like searching for a needle in a haystack.
          </h2>
          <p className="text-lg text-(color-text-muted)">
            Join thousands of modern teams and top-tier professionals connecting on the most advanced AI-native career platform.
          </p>
          
          <div className="mt-12 flex items-center gap-4">
            <div className="flex -space-x-3">
              <img className="size-10 rounded-full border-2 border-(color-bg) bg-(color-surface)" src="https://i.pravatar.cc/100?img=1" alt="Avatar" />
              <img className="size-10 rounded-full border-2 border-(color-bg) bg-(color-surface)" src="https://i.pravatar.cc/100?img=2" alt="Avatar" />
              <img className="size-10 rounded-full border-2 border-(color-bg) bg-(color-surface)" src="https://i.pravatar.cc/100?img=3" alt="Avatar" />
              <div className="flex size-10 items-center justify-center rounded-full border-2 border-(color-bg) bg-indigo-500 text-xs font-semibold text-white">
                +2k
              </div>
            </div>
            <p className="text-sm font-medium text-(color-text-muted)">
              Trusted by industry leaders
            </p>
          </div>
        </div>
      </div>

      {/* Right side form */}
      <div className="flex w-full flex-col items-center justify-center px-4 py-12 lg:w-1/2 lg:px-8">
        <Suspense
          fallback={
            <div className="h-96 w-full max-w-md animate-pulse p-8">
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
          <SignInForm />
        </Suspense>
      </div>
    </div>
  );
}
