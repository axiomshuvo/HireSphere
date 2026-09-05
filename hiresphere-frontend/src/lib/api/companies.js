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
    company?.slug ??
    company?.companySlug ??
    company?.companyId ??
    company?.id ??
    company?._id ??
    null
  );
}

function normId(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") {
    if (typeof value.toString === "function") {
      const s = value.toString();
      if (s !== "[object Object]") return s;
    }
    return "";
  }
  return String(value);
}

// Match a company against a URL id in ANY of its identity forms
// (slug, companySlug, companyId, id, _id) with ObjectId-safe comparison.
export function matchCompanyId(company, id) {
  if (!company) return false;
  const want = normId(id);
  if (!want) return false;
  return (
    [
      company.slug,
      company.companySlug,
      company.companyId,
      company.id,
      company._id,
      getCompanySlug(company),
    ].some((v) => normId(v) === want && normId(v) !== "")
  );
}

export function getCompanyName(company) {
  return company?.name ?? company?.tagline ?? "Unnamed company";
}

export function normalizeCompany(company) {
  if (!company || typeof company !== "object") return company;
  const next = { ...company };
  const id = next.slug ?? next.id ?? next._id;
  if (!next.companySlug) next.companySlug = id;
  return next;
}

export function normalizeCompanies(list) {
  return Array.isArray(list) ? list.map(normalizeCompany) : [];
}
