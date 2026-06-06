// Pure validator — safe to import on client and server.
// Use to block admin approval until all required fields, documents, and photos
// are present and correctly categorized.

export type CompletenessIssue = {
  field: string;
  label: string;
  message: string;
  category: "identity" | "location" | "contact" | "operations" | "media" | "documents";
};

export type CompletenessResult = {
  complete: boolean;
  issues: CompletenessIssue[];
  /** 0–100 */
  score: number;
};

// Loose shape — accepts the Supabase row or the in-progress form.
export type BusinessLike = Partial<{
  business_name: string | null;
  category: string | null;
  sub_sector: string | null;
  products_services: string | null;
  ownership_structure: string | null;
  registration_status: string | null;
  cac_number: string | null;
  operational_status: string | null;
  lga: string | null;
  community: string | null;
  address: string | null;
  business_phone: string | null;
  business_email: string | null;
  website: string | null;
  employee_count: string | null;
  market_reach: string | null;
  export_readiness: string | null;
  certifications: string[] | null;
  logo_url: string | null;
  image_urls: string[] | null;
  document_urls: string[] | null;
}>;

const isStr = (v: unknown, min = 1) =>
  typeof v === "string" && v.trim().length >= min;

const isArr = (v: unknown, min = 1) =>
  Array.isArray(v) && v.filter((x) => typeof x === "string" && x.trim().length > 0).length >= min;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s\-()]{6,}$/;

const IMAGE_EXT_RE = /\.(jpe?g|png|webp|gif|heic|avif)(\?|$)/i;
const DOC_EXT_RE = /\.(pdf|docx?|jpe?g|png|webp)(\?|$)/i;

export function validateBusinessCompleteness(b: BusinessLike): CompletenessResult {
  const issues: CompletenessIssue[] = [];
  const add = (i: CompletenessIssue) => issues.push(i);

  // Identity
  if (!isStr(b.business_name, 2)) add({ field: "business_name", label: "Business name", category: "identity", message: "Business name is missing." });
  if (!isStr(b.category)) add({ field: "category", label: "Sector", category: "identity", message: "Sector is required." });
  if (!isStr(b.products_services, 5)) add({ field: "products_services", label: "Products & services", category: "identity", message: "Products & services description is too short." });
  if (!isStr(b.ownership_structure)) add({ field: "ownership_structure", label: "Ownership structure", category: "identity", message: "Ownership structure is required." });
  if (!isStr(b.registration_status)) add({ field: "registration_status", label: "Registration status", category: "identity", message: "Registration status is required." });
  if (b.registration_status === "Registered (CAC)" && !isStr(b.cac_number, 3)) {
    add({ field: "cac_number", label: "CAC number", category: "identity", message: "CAC number is required when registration status is 'Registered (CAC)'." });
  }
  if (!isStr(b.operational_status)) add({ field: "operational_status", label: "Operational status", category: "identity", message: "Operational status is required." });

  // Location
  if (!isStr(b.lga)) add({ field: "lga", label: "LGA", category: "location", message: "LGA is required." });
  if (!isStr(b.community)) add({ field: "community", label: "Community / ward", category: "location", message: "Community is required." });
  if (!isStr(b.address, 3)) add({ field: "address", label: "Address", category: "location", message: "Street address is required." });

  // Contact
  if (!isStr(b.business_phone, 7) || !PHONE_RE.test((b.business_phone ?? "").trim())) {
    add({ field: "business_phone", label: "Business phone", category: "contact", message: "A valid business phone number is required." });
  }
  if (!isStr(b.business_email) || !EMAIL_RE.test((b.business_email ?? "").trim())) {
    add({ field: "business_email", label: "Business email", category: "contact", message: "A valid business email is required." });
  }

  // Operations & market
  if (!isStr(b.employee_count)) add({ field: "employee_count", label: "Employee count", category: "operations", message: "Employee count band is required." });
  if (!isStr(b.market_reach)) add({ field: "market_reach", label: "Market reach", category: "operations", message: "Market reach is required." });
  if (!isStr(b.export_readiness)) add({ field: "export_readiness", label: "Export readiness", category: "operations", message: "Export readiness is required." });

  // Media — photos
  const images = (b.image_urls ?? []).filter((u) => typeof u === "string" && u.trim().length > 0);
  if (images.length < 1) {
    add({ field: "image_urls", label: "Business photos", category: "media", message: "At least one business photo is required." });
  } else if (!images.every((u) => IMAGE_EXT_RE.test(u))) {
    add({ field: "image_urls", label: "Business photos", category: "media", message: "One or more photo uploads are not image files. Re-upload under the Photos section." });
  }

  // Documents (CAC, licenses, permits)
  const docs = (b.document_urls ?? []).filter((u) => typeof u === "string" && u.trim().length > 0);
  if (docs.length < 1) {
    add({ field: "document_urls", label: "Supporting documents", category: "documents", message: "At least one supporting document (CAC, licence, or permit) is required." });
  } else if (!docs.every((u) => DOC_EXT_RE.test(u))) {
    add({ field: "document_urls", label: "Supporting documents", category: "documents", message: "One or more documents are not in an accepted format (PDF, DOC, or image). Re-upload under the Documents section." });
  }

  // CAC document specifically when registered
  if (b.registration_status === "Registered (CAC)" && docs.length < 1) {
    add({ field: "document_urls", label: "CAC certificate", category: "documents", message: "Upload the CAC certificate under Supporting documents." });
  }

  // Scoring — coarse, just for the UI meter
  const totalChecks = 18;
  const score = Math.max(0, Math.round(((totalChecks - issues.length) / totalChecks) * 100));

  return { complete: issues.length === 0, issues, score };
}
