import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const exportBusinessesData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    const set = new Set((roles ?? []).map((r: { role: string }) => r.role));
    if (!set.has("state_admin") && !set.has("super_admin") && !set.has("lga_moderator")) {
      throw new Error("Forbidden");
    }
    const { data, error } = await supabase
      .from("businesses")
      .select("registry_id,business_name,category,sub_sector,products_services,ownership_structure,registration_status,cac_number,operational_status,lga,community,address,business_phone,business_email,website,employee_count,market_reach,export_readiness,certifications,approval_status,view_count,created_at,approved_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });
