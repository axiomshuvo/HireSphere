"use client";

import ImageUploader from "@/components/shared/ImageUploader";
import { MapPin, Picture } from "@gravity-ui/icons";
import {
  Input,
  InputGroup,
  Label,
  ListBox,
  ListBoxItem,
  Select,
  TextArea,
} from "@heroui/react";

export const COMPANY_INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Marketing",
  "Design",
  "Sales",
];

export const COMPANY_EMPLOYEE_RANGES = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201+ employees",
];

export const EMPTY_COMPANY_FORM = {
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

const inputClass = (error) =>
  `h-11 w-full rounded-xl border bg-[#17191d] px-3 text-sm text-white placeholder-gray-500 shadow-inner shadow-black/10 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
    error
      ? "border-red-500 focus:border-red-500"
      : "border-white/10 focus:border-indigo-500"
  }`;

const labelClass =
  "mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground";

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-500">{message}</p>;
}

export default function CompanyFormFields({ formData, errors = {}, onChange }) {
  const handleChange = (name, value) => onChange(name, value);

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2 border-b border-white/10 pb-3">
        <p className="text-sm font-semibold text-white">Company identity</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Give candidates a clear first impression of your business.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Label className={labelClass} htmlFor="company-name">
          Company Name
        </Label>
        <Input
          id="company-name"
          placeholder="e.g. Acme Corp"
          className={inputClass(errors.name)}
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
        <FieldError message={errors.name} />
      </div>

      <div className="flex flex-col gap-2">
        <Label className={labelClass} htmlFor="industry">
          Industry / Category
        </Label>
        <Select
          id="industry"
          selectedKey={formData.industry}
          onSelectionChange={(key) => handleChange("industry", key)}
        >
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {COMPANY_INDUSTRIES.map((industry) => (
                <ListBoxItem key={industry} id={industry} textValue={industry}>
                  {industry}
                </ListBoxItem>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      </div>

      <div className="flex flex-col gap-2 sm:col-span-2">
        <Label className={labelClass} htmlFor="company-tagline">
          Tagline
        </Label>
        <Input
          id="company-tagline"
          placeholder="One line about what your company does"
          className={inputClass(errors.tagline)}
          value={formData.tagline}
          onChange={(e) => handleChange("tagline", e.target.value)}
        />
        <FieldError message={errors.tagline} />
      </div>

      <div className="flex flex-col gap-2 sm:col-span-2">
        <Label className={labelClass} htmlFor="website-url">
          Website URL
        </Label>
        <InputGroup>
          <InputGroup.Prefix>https://</InputGroup.Prefix>
          <InputGroup.Input
            id="website-url"
            placeholder="www.company.com"
            className={inputClass(errors.website)}
            value={formData.website}
            onChange={(e) => handleChange("website", e.target.value)}
          />
        </InputGroup>
        <FieldError message={errors.website} />
      </div>

      <div className="flex flex-col gap-2">
        <Label className={labelClass} htmlFor="location">
          Location
        </Label>
        <InputGroup>
          <InputGroup.Prefix>
            <MapPin className="size-4" />
          </InputGroup.Prefix>
          <InputGroup.Input
            id="location"
            placeholder="City, Country"
            className={inputClass(errors.location)}
            value={formData.location}
            onChange={(e) => handleChange("location", e.target.value)}
          />
        </InputGroup>
        <FieldError message={errors.location} />
      </div>

      <div className="flex flex-col gap-2">
        <Label className={labelClass} htmlFor="employee-count">
          Employee Count Range
        </Label>
        <Select
          id="employee-count"
          selectedKey={formData.employeeCount}
          onSelectionChange={(key) => handleChange("employeeCount", key)}
        >
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {COMPANY_EMPLOYEE_RANGES.map((range) => (
                <ListBoxItem key={range} id={range} textValue={range}>
                  {range}
                </ListBoxItem>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
        <FieldError message={errors.employeeCount} />
      </div>

      <div className="flex flex-col gap-2 sm:col-span-2">
        <Label className={labelClass}>
          <span className="inline-flex items-center gap-1.5">
            <Picture className="size-3.5 text-emerald-300" />
            Company Logo
          </span>
        </Label>
        <ImageUploader
          value={formData.logo}
          onChange={(url) => handleChange("logo", url)}
        />
      </div>

      <div className="flex flex-col gap-2 sm:col-span-2">
        <Label className={labelClass}>Gallery</Label>
        <ImageUploader
          multiple
          value={formData.gallery}
          onChange={(urls) => handleChange("gallery", urls)}
        />
      </div>

      <div className="flex flex-col gap-2 sm:col-span-2">
        <Label className={labelClass} htmlFor="description">
          Brief Description
        </Label>
        <TextArea
          id="description"
          placeholder="Tell us about your company's mission and culture..."
          rows={4}
          className={inputClass(errors.description)}
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />
        <FieldError message={errors.description} />
      </div>
    </div>
  );
}
