"use server";

import { apiFetch } from "@/lib/api/client";
import { getCurrentUser, requireMod, requireAdmin } from "@/lib/core/session";
import { revalidateTag } from "next/cache";



async function adminRequest(path, { method = "GET", body, tags } = {}) {
  return await apiFetch(path, {
    method,
    ...(body ? { body: JSON.stringify(body) } : {}),
    tags,
    requireAuth: true,
    actor: await getCurrentUser().catch(() => null)
  });
}

export async function getAdminStats() {
  await requireMod();
  return adminRequest("/api/admin/stats", { tags: ["admin-stats"] });
}

export async function getAdminUsers(params = {}) {
  await requireMod();
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== "")),
  ).toString();
  return adminRequest(`/api/admin/users${qs ? `?${qs}` : ""}`, { tags: ["admin-users"] });
}

export async function getAdminUser(id) {
  await requireMod();
  return adminRequest(`/api/admin/users/${id}`, { tags: [`admin-user-${id}`] });
}

export async function updateAdminUserStatus(id, status) {
  await requireMod();
  return adminRequest(`/api/admin/users/${id}/status`, { method: "PATCH", body: { status } });
}

export async function flagAdminUser(id, flagged, reason) {
  await requireMod();
  return adminRequest(`/api/admin/users/${id}/flag`, { method: "POST", body: { flagged, reason } });
}

export async function addAdminUserNote(id, note) {
  await requireMod();
  return adminRequest(`/api/admin/users/${id}/notes`, { method: "POST", body: note });
}

export async function overrideAdminUserPlan(id, plan) {
  await requireAdmin();
  return adminRequest(`/api/admin/users/${id}/plan`, { method: "PUT", body: { plan } });
}

export async function getAdminRequests() {
  await requireMod();
  return adminRequest("/api/admin/requests", { tags: ["admin-requests"] });
}

export async function approveAdminRequest(id) {
  await requireMod();
  return adminRequest(`/api/admin/requests/${id}/approve`, { method: "POST" });
}

export async function rejectAdminRequest(id) {
  await requireMod();
  return adminRequest(`/api/admin/requests/${id}/reject`, { method: "POST" });
}

export async function downgradeSubscription(userId, targetPlan) {
  await requireAdmin();
  return adminRequest("/api/admin/subscriptions/downgrade", {
    method: "POST",
    body: { userId, targetPlan },
  });
}

export async function getAdminCompanies(params = {}) {
  await requireMod();
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== "")),
  ).toString();
  return adminRequest(`/api/admin/companies${qs ? `?${qs}` : ""}`, { tags: ["admin-companies"] });
}

export async function approveAdminCompany(id) {
  await requireMod();
  return adminRequest(`/api/admin/companies/${id}/approve`, { method: "POST" });
}

export async function updateAdminCompanyStatus(id, status) {
  await requireMod();
  return adminRequest(`/api/admin/companies/${id}/status`, { method: "PATCH", body: { status } });
}

export async function getAdminJobs(params = {}) {
  await requireMod();
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== "")),
  ).toString();
  return adminRequest(`/api/admin/jobs${qs ? `?${qs}` : ""}`, { tags: ["admin-jobs"] });
}

export async function updateAdminJobStatus(id, status) {
  await requireMod();
  return adminRequest(`/api/admin/jobs/${id}/status`, { method: "PATCH", body: { status } });
}

export async function deleteAdminJob(id) {
  await requireAdmin();
  return adminRequest(`/api/admin/jobs/${id}`, { method: "DELETE" });
}

export async function getAdminPlans() {
  await requireAdmin();
  return adminRequest("/api/admin/plans", { tags: ["admin-plans"] });
}

export async function createAdminPlan(plan) {
  await requireAdmin();
  const result = await adminRequest("/api/admin/plans", { method: "POST", body: plan });
  revalidateTag("admin-plans");
  revalidateTag("plans");
  return result;
}

export async function updateAdminPlan(id, plan) {
  await requireAdmin();
  const result = await adminRequest(`/api/admin/plans/${id}`, { method: "PUT", body: plan });
  revalidateTag("admin-plans");
  revalidateTag("plans");
  return result;
}

export async function deleteAdminPlan(id) {
  await requireAdmin();
  const result = await adminRequest(`/api/admin/plans/${id}`, { method: "DELETE" });
  revalidateTag("admin-plans");
  revalidateTag("plans");
  return result;
}

export async function getAdminRevenue() {
  await requireAdmin();
  return adminRequest("/api/admin/revenue", { tags: ["admin-revenue"] });
}

export async function getAdminModerators() {
  await requireAdmin();
  return adminRequest("/api/admin/moderators", { tags: ["admin-moderators"] });
}

export async function inviteAdminModerator(email) {
  await requireAdmin();
  return adminRequest("/api/admin/moderators/invite", { method: "POST", body: { email } });
}

export async function removeAdminModerator(id) {
  await requireAdmin();
  return adminRequest(`/api/admin/moderators/${id}`, { method: "DELETE" });
}

export async function getAdminActivity() {
  await requireMod();
  return adminRequest("/api/admin/activity", { tags: ["admin-activity"] });
}

export async function getAdminAuditLog(params = {}) {
  await requireAdmin();
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== "")),
  ).toString();
  return adminRequest(`/api/admin/audit-log${qs ? `?${qs}` : ""}`);
}
