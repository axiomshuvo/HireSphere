import CompanyProfile from "@/components/dashboard/company/CompanyProfile";

const company = {
  name: "LuminaTech Systems",
  shortName: "LuminaTech",
  initials: "L",
  tagline:
    "Engineering the future of enterprise cloud intelligence and distributed ledger solutions.",
  headquarters: "San Francisco",
  presence: "24 Countries",
  aboutFirstParagraph:
    "Founded in 2014, LuminaTech Systems builds mission-critical infrastructure for global enterprises. We combine cloud-native architecture with distributed systems research to help teams scale with confidence.",
  aboutSecondParagraph:
    "Our culture is rooted in deep technical craft, open collaboration, and a commitment to building technology that creates lasting value. With offices worldwide, we invest heavily in R&D and hold a growing portfolio of patents.",
  roles: [
    {
      title: "Senior Distributed Systems Engineer",
      location: "SF / Remote",
      salary: "$180k - $240k",
      avatars: ["J", "R"],
      extraApplicants: 12,
    },
    {
      title: "Product Design Lead",
      location: "New York",
      salary: "$160k - $210k",
      avatars: ["E", "M"],
      extraApplicants: 3,
    },
    {
      title: "DevOps Architect (Infra)",
      location: "Remote",
      salary: "$190k+",
      avatars: ["C"],
      extraApplicants: 22,
    },
  ],
  hiringTeam: {
    name: "Sarah Chen",
    title: "Head of Talent Acquisition",
    initials: "SC",
  },
};

export default function MyCompanyPage() {
  return (
    <div className="flex-1 px-4 py-8 lg:px-8">
      <CompanyProfile company={company} />
    </div>
  );
}
