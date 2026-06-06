import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const BusinessInput = z.object({
  business_name: z.string().trim().min(2).max(200),
  category: z.string().min(1).max(80),
  sub_sector: z.string().max(120).optional().nullable(),
  products_services: z.string().trim().min(5).max(4000),
  ownership_structure: z.string().min(1).max(80),
  registration_status: z.string().min(1).max(80),
  cac_number: z.string().max(60).optional().nullable(),
  operational_status: z.string().min(1).max(40),
  lga: z.string().min(1).max(80),
  community: z.string().trim().min(1).max(120),
  address: z.string().trim().min(3).max(400),
  business_phone: z.string().trim().min(7).max(40),
  business_email: z.string().trim().email().max(255),
  website: z.string().trim().max(255).optional().nullable(),
  employee_count: z.string().min(1).max(20),
  production_capacity: z.string().max(2000).optional().nullable(),
  market_reach: z.string().min(1).max(40),
  key_markets: z.string().max(1000).optional().nullable(),
  financing_needs: z.string().max(2000).optional().nullable(),
  certifications: z.array(z.string().max(80)).max(20).default([]),
  export_readiness: z.string().min(1).max(40),
  logo_url: z.string().max(500).optional().nullable(),
  image_urls: z.array(z.string().max(500)).max(5).default([]),
  document_urls: z.array(z.string().max(500)).max(5).default([]),
});

export const upsertMyBusiness = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => BusinessInput.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: existing } = await supabase.from("businesses").select("id,approval_status").eq("user_id", userId).maybeSingle();
    if (existing) {
      if (existing.approval_status === "approved") throw new Error("Approved businesses cannot be edited without admin unlock.");
      // Resubmitting after rejection/suspension → send back to the pending queue
      const updatePayload: Record<string, unknown> = { ...data };
      if (existing.approval_status === "rejected" || existing.approval_status === "suspended") {
        updatePayload.approval_status = "pending";
        updatePayload.rejection_reason = null;
      }
      const { error } = await supabase.from("businesses").update(updatePayload).eq("id", existing.id);
      if (error) throw new Error(error.message);
      return { id: existing.id, status: "updated" as const };
    }
    const { data: row, error } = await supabase.from("businesses").insert({ ...data, user_id: userId }).select("id").single();
    if (error) throw new Error(error.message);
    return { id: row.id, status: "created" as const };
  });


export const getMyBusiness = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase.from("businesses").select("*").eq("user_id", userId).maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

const SignedUrlInput = z.object({ path: z.string().min(1).max(500) });
export const getSignedUploadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => SignedUrlInput.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const path = `${userId}/${data.path}`;
    const { data: signed, error } = await supabase.storage.from("business-media").createSignedUploadUrl(path);
    if (error) throw new Error(error.message);
    const { data: pub } = supabase.storage.from("business-media").getPublicUrl(path);
    return { uploadUrl: signed.signedUrl, token: signed.token, path, publicUrl: pub.publicUrl };
  });
