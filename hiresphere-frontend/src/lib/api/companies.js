export function generateCompanySlug(name) {
  const slug =
    String(name ?? "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "company";
  const random = Math.floor(Math.random() * 900) + 100;
  return `cmp-${slug}-${random}`;
}

export function getCompanySlug(company) {
  return (
    company?.slug ?? company?.companySlug ?? company?.id ?? company?._id ?? null
  );
}

export function getCompanyName(company) {
  return company?.name ?? company?.tagline ?? "Unnamed company";
}

export function normalizeCompany(company) {
  if (!company || typeof company !== "object") return company;
  const next = { ...company };
  const id = next.id ?? next._id;
  if (!next.companySlug) next.companySlug = id;
  return next;
}

export function normalizeCompanies(list) {
  return Array.isArray(list) ? list.map(normalizeCompany) : [];
}
