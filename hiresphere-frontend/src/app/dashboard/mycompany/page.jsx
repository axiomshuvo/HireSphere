"use client";

import CompanyCard from "@/components/dashboard/company/CompanyCard";
import ButtonLink from "@/components/shared/ButtonLink";
import { fetchCompanies } from "@/lib/actions/company";
import { normalizeCompanies } from "@/lib/api/companies";
import { CirclePlus } from "@gravity-ui/icons";
import { Typography, toast } from "@heroui/react";
import { useEffect, useState } from "react";

export default function MyCompanyPage() {
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchCompanies()
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : (data?.companies ?? []);
        setCompanies(normalizeCompanies(list));
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("[MyCompanyPage] Failed to load companies:", error);
        toast.warning("Could not load companies", {
          description: "Make sure the API server is running.",
        });
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex-1 px-4 py-8 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            My Companies
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Every company you manage on HireSphere, in one place.
          </p>
        </div>

        <ButtonLink href="/dashboard/mycompany/new" variant="primary">
          <CirclePlus className="size-4" />
          Add Company
        </ButtonLink>
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center py-16">
          <Typography.Paragraph className="text-sm text-muted-foreground">
            Loading companies…
          </Typography.Paragraph>
        </div>
      ) : companies.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-default bg-content1 px-6 py-16 text-center">
          <h2 className="text-lg font-semibold text-white">No companies yet</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Register your first company to start posting jobs and managing
            applicants.
          </p>
          <ButtonLink
            href="/dashboard/mycompany/new"
            variant="primary"
            className="mt-2"
          >
            <CirclePlus className="size-4" />
            Add Your First Company
          </ButtonLink>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {companies.map((company) => (
            <CompanyCard
              key={company.companySlug ?? company.id ?? company._id}
              company={company}
            />
          ))}
        </div>
      )}
    </div>
  );
}
