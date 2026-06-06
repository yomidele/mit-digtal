import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { generateCertificatePdf } from "./certificate-pdf.server";

const IdInput = z.object({ businessId: z.string().uuid() });

export const recordCertificateDownload = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => IdInput.parse(i))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: biz, error: bizErr } = await supabaseAdmin
      .from("businesses")
      .select("id,user_id,registry_id,business_name,approval_status")
      .eq("id", data.businessId)
      .maybeSingle();
    if (bizErr || !biz) throw new Error("Business not found");
    if (biz.approval_status !== "approved") throw new Error("Certificate unavailable");

    const { error } = await supabaseAdmin.from("audit_log").insert({
      admin_id: userId,
      action: "certificate_download",
      target_entity: "business",
      target_id: biz.id,
      details: {
        user_id: userId,
        business_id: biz.id,
        business_name: biz.business_name,
        registry_id: biz.registry_id,
      },
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getMyDownloadHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("audit_log")
      .select("id,created_at,details,target_id")
      .eq("action", "certificate_download")
      .eq("admin_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const downloadMyCertificate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => IdInput.parse(i))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: biz, error } = await supabaseAdmin
      .from("businesses")
      .select("id,user_id,business_name,category,lga,community,registry_id,approved_at,approval_status")
      .eq("id", data.businessId)
      .maybeSingle();
    if (error || !biz) throw new Error("Business not found");
    if (biz.approval_status !== "approved") throw new Error("Certificate unavailable");
    if (biz.user_id !== userId) throw new Error("Forbidden");

    const req = getRequest();
    const proto = req.headers.get("x-forwarded-proto") ?? "https";
    const host = req.headers.get("host")!;
    const origin = `${proto}://${host}`;

    const bytes = await generateCertificatePdf(biz, origin);
    // Log download
    await supabaseAdmin.from("audit_log").insert({
      admin_id: userId,
      action: "certificate_download",
      target_entity: "business",
      target_id: biz.id,
      details: {
        user_id: userId,
        business_id: biz.id,
        business_name: biz.business_name,
        registry_id: biz.registry_id,
      },
    });

    // base64 encode
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    const base64 = btoa(binary);
    const filename = `${(biz.registry_id ?? biz.id).replace(/[^A-Za-z0-9_-]/g, "_")}.pdf`;
    return { base64, filename };
  });
