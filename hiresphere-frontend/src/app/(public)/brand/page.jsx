import { Card } from "@heroui/react";

const rules = [
  {
    title: "Logo",
    text: "Use the HireSphere wordmark as provided. Keep clear space equal to the cap height on all sides. Never stretch, recolor, or add effects.",
  },
  {
    title: "Colors",
    text: "Primary blue #0072FF and accent orange #FF6A00 on dark surfaces. Indigo #6366F1 highlights interactive elements.",
  },
  {
    title: "Voice",
    text: "Clear, human, professional. Talk about people and work — never hype, never jargon.",
  },
  {
    title: "Don'ts",
    text: "Don't place the logo on busy backgrounds, don't translate or rename the brand, don't imply endorsement by listed companies.",
  },
];

export default function BrandPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 lg:px-8">
      <span className="inline-flex items-center rounded-full border border-(color-border) bg-white/[0.02] px-4 py-1.5 text-xs font-medium text-(color-text-muted)">
        Resources
      </span>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-(color-text)">
        Brand Guideline
      </h1>
      <p className="mt-2 max-w-xl text-sm text-(color-text-muted)">
        How to represent HireSphere — the AI-native career platform for people
        who take their work seriously.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {rules.map((r) => (
          <Card
            key={r.title}
            className="rounded-2xl border border-(color-border) bg-(color-surface) p-5"
          >
            <h2 className="font-semibold text-(color-text)">{r.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-(color-text-muted)">
              {r.text}
            </p>
          </Card>
        ))}
      </div>

      <p className="mt-8 text-sm text-(color-text-muted)">
        Press assets or usage questions: support@hire-sphere.ai
      </p>
    </div>
  );
}
