"use client";

import { ArrowUpToLine, MapPin } from "@gravity-ui/icons";
import {
  Input,
  InputGroup,
  Label,
  ListBox,
  ListBoxItem,
  Select,
  TextArea,
  Typography,
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
};

const inputClass = (error) =>
  `w-full rounded-lg border bg-[#1b1c1e] px-3 py-2 text-sm text-white placeholder-gray-500 transition-colors focus:outline-none ${
    error
      ? "border-red-500 focus:border-red-500"
      : "border-white/10 focus:border-indigo-500"
  }`;

const labelClass = "mb-1 block text-xs font-medium text-gray-400";

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-500">{message}</p>;
}

export default function CompanyFormFields({
  formData,
  errors = {},
  onChange,
}) {
  const handleChange = (name, value) => onChange(name, value);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-2">
        <Label htmlFor="company-name">Company Name</Label>
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
        <Label htmlFor="industry">Industry / Category</Label>
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
        <Label htmlFor="company-tagline">Tagline</Label>
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
        <Label htmlFor="website-url">Website URL</Label>
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
        <Label htmlFor="location">Location</Label>
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
        <Label htmlFor="employee-count">Employee Count Range</Label>
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
        <Label>Company Logo</Label>
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-default p-6 text-center">
          <ArrowUpToLine className="size-6 text-muted-foreground" />
          <Typography.Paragraph className="font-medium text-white">
            Upload image
          </Typography.Paragraph>
          <Typography.Paragraph className="text-xs text-muted-foreground">
            PNG, JPG up to 5MB
          </Typography.Paragraph>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:col-span-2">
        <Label htmlFor="description">Brief Description</Label>
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
