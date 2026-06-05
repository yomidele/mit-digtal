import { createServerFn } from "@tanstack/react-start";

export const getPublicStats = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [{ count: total }, sectors, lgas] = await Promise.all([
    supabaseAdmin.from("businesses").select("*", { count: "exact", head: true }).eq("approval_status", "approved"),
    supabaseAdmin.from("businesses").select("category").eq("approval_status", "approved"),
    supabaseAdmin.from("businesses").select("lga").eq("approval_status", "approved"),
  ]);
  const sectorSet = new Set((sectors.data ?? []).map((r) => r.category));
  const lgaSet = new Set((lgas.data ?? []).map((r) => r.lga));
  return {
    totalBusinesses: total ?? 0,
    totalSectors: sectorSet.size,
    totalLgas: lgaSet.size,
    totalLgasCovered: 16,
  };
});
