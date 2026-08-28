"use client";

import CompanyFormFields from "@/components/dashboard/company/CompanyFormFields";
import ButtonLink from "@/components/shared/ButtonLink";
import { getRecruiterCompanies, updateRecruiterCompany } from "@/lib/actions/company";
import {
  generateCompanySlug,
  getCompanySlug,
  normalizeCompany,
} from "@/lib/api/companies";
import { ArrowLeft } from "@gravity-ui/icons";
import { Button, Typography, toast } from "@heroui/react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

const EMPTY_FORM = {
  name: "",
  industry: "Technology",
  tagline: "",
  website: "",
  location: "",
  employeeCount: "1-10 employees",
  description: "",
  logo: "",
  gallery: [],
};

function buildFormData(company) {
  if (!company) return EMPTY_FORM;
  return {
    name: company.name ?? "",
    industry: company.industry ?? "Technology",
    tagline: company.tagline ?? "",
    website: company.website ?? "",
    location: company.location ?? "",
    employeeCount: company.employeeCount ?? "1-10 employees",
    description: company.description ?? "",
    logo: company.logo ?? "",
    gallery: Array.isArray(company.gallery) ? company.gallery : [],
  };
}

export default function EditCompanyPage({ params }) {
  const { id } = use(params);
  const router = useRouter();

  const [company, setCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getRecruiterCompanies({ pageSize: 100 })
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : (data?.items ?? []);
        const found =
          list.map(normalizeCompany).find((c) => getCompanySlug(c) === id) ??
          null;
        setCompany(found);
        setFormData(buildFormData(found));
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("[EditCompanyPage] Failed to load company:", error);
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

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("[EditCompanyPage] handleSubmit fired, id=", id);

    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Company name is required.";
    if (!formData.tagline.trim()) newErrors.tagline = "Tagline is required.";
    if (!formData.website.trim())
      newErrors.website = "Website URL is required.";
    if (!formData.location.trim()) newErrors.location = "Location is required.";
    if (!formData.employeeCount) {
      newErrors.employeeCount = "Employee count range is required.";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Brief description is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      console.log("[EditCompanyPage] validation failed:", newErrors);
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    const trimmedName = formData.name.trim();
    const originalSlug = getCompanySlug(company);
    const originalName = company?.name ?? "";
    const newSlug =
      trimmedName !== originalName
        ? generateCompanySlug(trimmedName)
        : originalSlug;

    const payload = {
      name: trimmedName,
      industry: formData.industry,
      tagline: formData.tagline.trim(),
      website: formData.website.trim(),
      location: formData.location.trim(),
      employeeCount: formData.employeeCount,
      description: formData.description.trim(),
      logo: formData.logo,
      gallery: formData.gallery,
      companySlug: newSlug,
    };

    try {
      await updateRecruiterCompany(originalSlug, payload);
      toast.success("Company updated", {
        description: `${trimmedName} is saved.`,
      });
      router.push(`/dashboard/mycompany/${newSlug}`);
    } catch (error) {
      console.error("[EditCompanyPage] Error updating company:", error);
      toast.warning("Could not update company. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="rounded-2xl border border-default bg-content1 p-8 text-center">
          <Typography.Heading
            className="text-xl font-semibold text-white"
            level={2}
          >
            No company found
          </Typography.Heading>
          <Typography.Paragraph className="mt-2 text-sm text-muted-foreground">
            We couldn&apos;t find a company with the id{" "}
            <span className="font-mono text-white">{id}</span>.
          </Typography.Paragraph>
          <ButtonLink
            href="/dashboard/mycompany"
            variant="primary"
            className="mx-auto mt-6"
          >
            <ArrowLeft className="size-4" />
            Back to My Companies
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 px-4 py-8 lg:px-8">
      <div className="mx-auto mb-6 max-w-3xl">
        <ButtonLink
          href={`/dashboard/mycompany/${id}`}
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Back to Company
        </ButtonLink>
      </div>

      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Update company
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Update the details for{" "}
            <span className="text-white">{company.name}</span>.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-2xl border border-white/10 bg-[#121316] p-5 sm:p-6"
        >
          <CompanyFormFields
            formData={formData}
            errors={errors}
            onChange={handleChange}
          />

          <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-4">
            <ButtonLink href={`/dashboard/mycompany/${id}`} variant="secondary">
              Cancel
            </ButtonLink>
            <Button type="submit" variant="primary" isDisabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
