export function getCompanyId(company) {
  return company?.companyId ?? company?.id ?? company?._id ?? null;
}

export function getCompanyName(company) {
  return company?.name ?? company?.shortName ?? "Company";
}

export function normalizeCompany(company) {
  if (!company) return company;
  const id = getCompanyId(company);
  if (!id) return company;
  const next = { ...company };
  if (!next.companyId) next.companyId = id;
  if (!next.id) next.id = id;
  return next;
}

export function normalizeCompanies(companies) {
  if (!Array.isArray(companies)) return [];
  return companies.map(normalizeCompany);
}
