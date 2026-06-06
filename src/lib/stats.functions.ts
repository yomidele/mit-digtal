import { createServerFn } from "@tanstack/react-start";

export const getPublicStats = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [{ count: total }, sectors, lgas] = await Promise.all([
    supabaseAdmin.from("businesses").select("*", { count: "exact", head: true }).eq("approval_status", "approved"),
    supabaseAdmin.from("businesses").select("category").eq("approval_status", "approved"),
    supabaseAdmin.from("businesses").select("lga").eq("approval_status", "approved"),
  ]);
  const sectorList = (sectors.data ?? []).map((r) => r.category);
  const sectorSet = new Set(sectorList);
  const lgaSet = new Set((lgas.data ?? []).map((r) => r.lga));
  const sectorCounts: Record<string, number> = {};
  for (const c of sectorList) sectorCounts[c] = (sectorCounts[c] ?? 0) + 1;
  return {
    totalBusinesses: total ?? 0,
    totalSectors: sectorSet.size,
    totalLgas: lgaSet.size,
    totalLgasCovered: 16,
    sectorCounts,
  };
});
