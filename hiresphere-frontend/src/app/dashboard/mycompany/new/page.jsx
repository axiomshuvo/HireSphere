"use client";

import CompanyFormFields, {
  EMPTY_COMPANY_FORM,
} from "@/components/dashboard/company/CompanyFormFields";
import ButtonLink from "@/components/shared/ButtonLink";
import { createRecruiterCompany } from "@/lib/actions/company";

import { generateCompanySlug, getCompanySlug } from "@/lib/api/companies";
import { ArrowLeft, OfficeBadge } from "@gravity-ui/icons";
import { Button, toast } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewCompanyPage() {
  const router = useRouter();
  const [formData, setFormData] = useState(EMPTY_COMPANY_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

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
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    const payload = {
      ...formData,
      companySlug: generateCompanySlug(formData.name),
    };

    try {
      const created = await createRecruiterCompany(payload);
      toast.success(`Company "${formData.name}" registered successfully!`);
      const createdCompany = created?.company ?? created;
      const newId = getCompanySlug(createdCompany);
      router.push(
        newId ? `/dashboard/mycompany/${newId}` : "/dashboard/mycompany",
      );
    } catch (error) {
      console.error("[NewCompanyPage] Error creating company:", error);
      const message = error?.message || "Unknown error";
      toast.warning("Could not register company", {
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 px-4 py-8 lg:px-8">
      <div className="mx-auto mb-6 max-w-3xl">
        <ButtonLink
          href="/dashboard/mycompany"
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to My Companies
        </ButtonLink>
      </div>

      <div className="mx-auto max-w-4xl">
        <div className="relative mb-6 overflow-hidden rounded-2xl border border-emerald-500/20 bg-content1 p-6 sm:p-8">
          <div className="absolute -right-10 -top-20 size-56 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="relative flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/25">
              <OfficeBadge className="size-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-500">
                Company profile
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Add a new company
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter your business details to start hiring on HireSphere.
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-2xl border border-default bg-content1 p-6 shadow-2xl shadow-black/10 sm:p-8"
        >
          <CompanyFormFields
            formData={formData}
            errors={errors}
            onChange={handleChange}
          />

          <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-4">
            <ButtonLink
              href="/dashboard/mycompany"
              variant="secondary"
              className="h-11 rounded-xl px-5"
            >
              Cancel
            </ButtonLink>
            <Button
              type="submit"
              variant="primary"
              isDisabled={isSubmitting}
              className="h-11 cursor-pointer rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 font-semibold text-foreground shadow-lg shadow-emerald-500/20"
            >
              {isSubmitting ? "Registering…" : "Register Company"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
