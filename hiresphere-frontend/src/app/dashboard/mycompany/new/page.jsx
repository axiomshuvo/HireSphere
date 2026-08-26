"use client";

import ButtonLink from "@/components/shared/ButtonLink";
import CompanyFormFields, {
  EMPTY_COMPANY_FORM,
} from "@/components/dashboard/company/CompanyFormFields";
import { createCompany } from "@/lib/actions/company";
import { ArrowLeft } from "@gravity-ui/icons";
import { Button, toast } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

function generateCompanyId(name) {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const random = Math.floor(100 + Math.random() * 900);
  return `cmp-${slug || "company"}-${random}`;
}

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
      return;
    }

    setIsSubmitting(true);

    const payload = {
      ...formData,
      companyId: generateCompanyId(formData.name),
    };

    console.log("[NewCompanyPage] Payload:", payload);

    try {
      const created = await createCompany(payload);
      console.log("[NewCompanyPage] Server response:", created);
      toast.success(`Company "${formData.name}" registered successfully!`);
      const createdCompany = created?.company ?? created;
      const newId =
        createdCompany?.companyId ??
        createdCompany?.id ??
        createdCompany?._id ??
        null;
      router.push(
        newId ? `/dashboard/mycompany/${newId}` : "/dashboard/mycompany",
      );
    } catch (error) {
      console.error("[NewCompanyPage] Error creating company:", error);
      toast.warning("Could not register company. Please try again.");
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
          className="text-muted-foreground hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Back to My Companies
        </ButtonLink>
      </div>

      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Add a new company
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your business details to start hiring on HireSphere.
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
            <ButtonLink href="/dashboard/mycompany" variant="secondary">
              Cancel
            </ButtonLink>
            <Button type="submit" variant="primary" isDisabled={isSubmitting}>
              {isSubmitting ? "Registering…" : "Register Company"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
