export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 lg:px-8">
      <span className="inline-flex items-center rounded-full border border-(color-border) bg-white/[0.02] px-4 py-1.5 text-xs font-medium text-(color-text-muted)">
        Legal
      </span>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-(color-text)">
        Privacy Guideline
      </h1>
      <div className="mt-6 space-y-5 text-sm leading-relaxed text-(color-text-muted)">
        <p>
          HireSphere stores your account profile, companies, jobs, saved roles,
          and applications in order to run the hiring marketplace. Recruiters
          see only the application details candidates submit to their roles.
        </p>
        <p>
          Authentication sessions use secure httpOnly cookies. Payment details
          are processed by Stripe — we never store card numbers on our servers.
        </p>
        <p>
          You can update your profile at any time from the dashboard, withdraw
          applications to remove them from recruiter views, and contact
          support@hire-sphere.ai for data export or deletion requests.
        </p>
      </div>
    </div>
  );
}
