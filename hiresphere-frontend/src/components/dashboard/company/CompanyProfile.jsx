"use client";

import { Globe, MapPin, Persons } from "@gravity-ui/icons";
import { Card, Typography } from "@heroui/react";
import ActiveRolesList from "./ActiveRolesList";
import CompanyHeader from "./CompanyHeader";
import CompanyStatCard from "./CompanyStatCard";
import HiringTeamCard from "./HiringTeamCard";
import LifeAtCompany from "./LifeAtCompany";

export default function CompanyProfile({ company }) {
  const stats = [
    { label: "Employees", value: "12,400+", icon: Persons },
    { label: "Headquarters", value: company.headquarters, icon: MapPin },
    { label: "Presence", value: company.presence, icon: Globe },
  ];

  return (
    <div className="space-y-6">
      <CompanyHeader company={company} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <Card className="rounded-2xl border border-default bg-content1 p-5">
            <Typography.Heading className="text-lg font-semibold text-white" level={2}>
              About
            </Typography.Heading>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>{company.aboutFirstParagraph}</p>
              <p>{company.aboutSecondParagraph}</p>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <CompanyStatCard key={stat.label} {...stat} />
            ))}
          </div>

          <LifeAtCompany title={`Life at ${company.shortName}`} />
        </div>

        <div className="space-y-6">
          <ActiveRolesList roles={company.roles} />
          <HiringTeamCard member={company.hiringTeam} />
        </div>
      </div>
    </div>
  );
}
