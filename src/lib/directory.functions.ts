import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ListInput = z.object({
  search: z.string().max(200).optional(),
  category: z.string().max(80).optional(),
  lga: z.string().max(80).optional(),
  marketReach: z.string().max(40).optional(),
  page: z.number().int().min(1).max(500).default(1),
});

export const listDirectory = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ListInput.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const pageSize = 20;
    const from = (data.page - 1) * pageSize;
    const to = from + pageSize - 1;
    let q = supabaseAdmin
      .from("businesses")
      .select(
        "id,business_name,category,sub_sector,lga,community,products_services,logo_url,market_reach,registry_id,certifications",
        { count: "exact" },
      )
      .eq("approval_status", "approved")
      .order("approved_at", { ascending: false })
      .range(from, to);
    if (data.search) {
      const s = data.search.trim();
      // Registry ID looks like MIT/XXX/YYYY/00001 — match exactly or as a prefix.
      if (/^MIT\//i.test(s) || /\//.test(s)) {
        q = q.ilike("registry_id", `${s}%`);
      } else {
        q = q.or(`business_name.ilike.%${s}%,registry_id.ilike.%${s}%`);
      }
    }
    if (data.category) q = q.eq("category", data.category);
    if (data.lga) q = q.eq("lga", data.lga);
    if (data.marketReach) q = q.eq("market_reach", data.marketReach);
    const { data: rows, count, error } = await q;
    if (error) throw new Error(error.message);
    return { rows: rows ?? [], count: count ?? 0, pageSize };
  });

const IdInput = z.object({ id: z.string().uuid() });

export const getBusiness = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => IdInput.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("businesses")
      .select(
        "id,business_name,category,sub_sector,products_services,ownership_structure,registration_status,operational_status,lga,community,address,business_phone,business_email,website,employee_count,production_capacity,market_reach,key_markets,certifications,export_readiness,logo_url,image_urls,registry_id,view_count,approved_at",
      )
      .eq("id", data.id)
      .eq("approval_status", "approved")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;
    // fire-and-forget view count increment
    await supabaseAdmin.from("businesses").update({ view_count: (row.view_count ?? 0) + 1 }).eq("id", data.id);
    return row;
  });
