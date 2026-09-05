export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 lg:px-8">
      <span className="inline-flex items-center rounded-full border border-(color-border) bg-white/[0.02] px-4 py-1.5 text-xs font-medium text-(color-text-muted)">
        Legal
      </span>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-(color-text)">
        Terms &amp; Policy
      </h1>
      <div className="mt-6 space-y-5 text-sm leading-relaxed text-(color-text-muted)">
        <p>
          By using HireSphere you agree to use the platform lawfully: post only
          genuine roles and companies you represent, submit only truthful
          application details, and respect other users&apos; data.
        </p>
        <p>
          Job content remains the responsibility of the posting recruiter. We
          may hide or remove listings that are misleading, discriminatory, or
          abusive. Accounts that violate these terms may be limited or closed.
        </p>
        <p>
          Subscriptions (Seeker Pro/Premium, Recruiter Pro/Enterprise) renew per
          their billing cadence until cancelled. Plan limits apply as described
          on the pricing page.
        </p>
        <p>Questions about these terms: support@hire-sphere.ai</p>
      </div>
    </div>
  );
}
