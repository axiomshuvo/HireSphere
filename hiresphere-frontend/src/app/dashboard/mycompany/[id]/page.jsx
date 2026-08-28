"use client";

import CompanyAbout from "@/components/dashboard/company/CompanyAbout";
import CompanyGallery from "@/components/dashboard/company/CompanyGallery";
import CompanyHeader from "@/components/dashboard/company/CompanyHeader";
import CompanyJobsStrip from "@/components/dashboard/company/CompanyJobsStrip";
import CompanyNotFound from "@/components/dashboard/company/CompanyNotFound";
import CompanyQuickInfo from "@/components/dashboard/company/CompanyQuickInfo";
import CompanyStats from "@/components/dashboard/company/CompanyStats";
import HiringTeamCard from "@/components/dashboard/company/HiringTeamCard";
import OpenRoles from "@/components/dashboard/company/OpenRoles";
import ButtonLink from "@/components/shared/ButtonLink";
import { deleteCompany, fetchCompanies } from "@/lib/actions/company";
import { fetchJobs } from "@/lib/actions/jobs";
import { getCompanySlug, normalizeCompany } from "@/lib/api/companies";
import { ArrowLeft, TrashBin } from "@gravity-ui/icons";
import { Button, Typography, toast } from "@heroui/react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

function getCompanyInitials(company) {
  if (company?.initials) return company.initials;
  const name = company?.name?.trim();
  if (!name) return "?";
  const parts = name.split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return `${first}${last}`.toUpperCase() || name[0].toUpperCase();
}

export default function CompanyDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();

  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.all([fetchCompanies(), fetchJobs()])
      .then(([companiesData, jobsData]) => {
        if (cancelled) return;
        const list = Array.isArray(companiesData)
          ? companiesData
          : (companiesData?.companies ?? []);
        const found =
          list.map(normalizeCompany).find((c) => getCompanySlug(c) === id) ??
          null;
        setCompany(found);

        const allJobs = Array.isArray(jobsData) ? jobsData : [];
        setJobs(allJobs.filter((j) => j.companySlug === id));
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("[CompanyDetailPage] Failed to load company:", error);
        setHasError(true);
        toast.warning("Could not load company", {
          description: "Make sure the API server is running.",
        });
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleDelete = async () => {
    if (!company) return;
    setIsDeleting(true);

    const companySlug = getCompanySlug(company);
    console.log("[CompanyDetailPage] Deleting company:", companySlug);

    try {
      await deleteCompany(companySlug);
      toast.success("Company deleted", {
        description: `${company.name} was removed.`,
      });
      router.push("/dashboard/mycompany");
    } catch (error) {
      console.error("[CompanyDetailPage] Error deleting company:", error);
      toast.warning("Could not delete company. Please try again.");
      setIsDeleting(false);
      setIsConfirmingDelete(false);
    }
  };

  const handleEdit = () => {
    router.push(`/dashboard/mycompany/${id}/update`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <Typography.Paragraph className="text-sm text-muted-foreground">
          Loading company…
        </Typography.Paragraph>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-16">
        <Typography.Paragraph className="text-sm text-muted-foreground">
          Could not load company.
        </Typography.Paragraph>
        <Button variant="primary" onPress={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (!company) {
    return <CompanyNotFound companySlug={id} />;
  }

  const normalizedCompany = {
    ...company,
    id: getCompanySlug(company),
    initials: getCompanyInitials(company),
  };

  return (
    <div className="flex-1 px-4 py-8 lg:px-8">
      <div className="mx-auto mb-6 max-w-6xl">
        <ButtonLink
          href="/dashboard/mycompany"
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Back to My Companies
        </ButtonLink>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <CompanyHeader
          company={normalizedCompany}
          onEdit={handleEdit}
          onDelete={() => setIsConfirmingDelete(true)}
        />

        {isConfirmingDelete && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3">
            <div className="flex items-center gap-3">
              <TrashBin className="size-5 shrink-0 text-red-400" />
              <div>
                <p className="text-sm font-medium text-white">
                  Delete <span className="font-semibold">{company.name}</span>?
                </p>
                <p className="text-xs text-muted-foreground">
                  This permanently removes the company and all of its data.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onPress={() => setIsConfirmingDelete(false)}
                isDisabled={isDeleting}
                type="button"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onPress={handleDelete}
                isDisabled={isDeleting}
                type="button"
              >
                {isDeleting ? "Deleting…" : "Yes, delete"}
              </Button>
            </div>
          </div>
        )}

        <CompanyStats company={normalizedCompany} />

        <CompanyGallery images={company.gallery} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <CompanyAbout company={company} />
            <OpenRoles roles={company.roles} />
            <CompanyJobsStrip jobs={jobs} />
          </div>

          <div className="flex flex-col gap-6 lg:col-span-1">
            {company.hiringTeam && (
              <HiringTeamCard
                title="HIRING TEAM"
                member={company.hiringTeam}
                actionLabel="Message Team"
              />
            )}
            <CompanyQuickInfo company={normalizedCompany} />
          </div>
        </div>
      </div>
    </div>
  );
}
