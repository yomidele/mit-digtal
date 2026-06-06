import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

async function assertAdmin(supabase: any, userId: string, allowModerator = false) {
  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const set = new Set((roles ?? []).map((r: { role: string }) => r.role));
  const ok = set.has("state_admin") || set.has("super_admin") || (allowModerator && set.has("lga_moderator"));
  if (!ok) throw new Error("Forbidden: admin role required");
  return { roles: set as Set<string> };
}

const ListInput = z.object({
  status: z.enum(["pending", "approved", "rejected", "suspended", "all"]).default("pending"),
  search: z.string().max(200).optional(),
  lga: z.string().max(80).optional(),
  category: z.string().max(80).optional(),
  page: z.number().int().min(1).max(500).default(1),
});

export const listAdminBusinesses = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => ListInput.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId, true);
    const pageSize = 25;
    const from = (data.page - 1) * pageSize;
    const to = from + pageSize - 1;
    let q = supabase
      .from("businesses")
      .select("id,business_name,category,sub_sector,lga,community,business_email,business_phone,products_services,approval_status,rejection_reason,registry_id,view_count,user_id,created_at,approved_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);
    if (data.status !== "all") q = q.eq("approval_status", data.status);
    if (data.search) q = q.ilike("business_name", `%${data.search}%`);
    if (data.lga) q = q.eq("lga", data.lga);
    if (data.category) q = q.eq("category", data.category);
    const { data: rows, count, error } = await q;
    if (error) throw new Error(error.message);
    return { rows: rows ?? [], count: count ?? 0, pageSize };
  });

export const getAdminBusiness = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId, true);
    const { data: biz, error } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!biz) throw new Error("Business not found");
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name,phone,created_at")
      .eq("id", biz.user_id)
      .maybeSingle();
    return { ...biz, owner_profile: profile ?? null };
  });


const IdInput = z.object({ id: z.string().uuid() });
const RejectInput = z.object({ id: z.string().uuid(), reason: z.string().trim().min(3).max(2000) });

async function notify(supabase: any, userId: string, title: string, message: string) {
  await supabase.from("notifications").insert({ user_id: userId, title, message });
}
async function audit(supabase: any, adminId: string, action: string, targetId: string, details: Record<string, unknown>) {
  await supabase.from("audit_log").insert({ admin_id: adminId, action, target_entity: "business", target_id: targetId, details });
}

export const approveBusiness = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => IdInput.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId, true);
    const { data: row, error } = await supabase
      .from("businesses")
      .update({ approval_status: "approved", approved_by: userId, rejection_reason: null })
      .eq("id", data.id)
      .select("id,user_id,business_name,registry_id")
      .single();
    if (error) throw new Error(error.message);
    await notify(supabase, row.user_id, "Your business was approved", `${row.business_name} is now listed in the registry. Registry ID: ${row.registry_id}`);
    await audit(supabase, userId, "approve", row.id, { registry_id: row.registry_id });
    return row;
  });

export const rejectBusiness = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => RejectInput.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId, true);
    const { data: row, error } = await supabase
      .from("businesses")
      .update({ approval_status: "rejected", rejection_reason: data.reason })
      .eq("id", data.id)
      .select("id,user_id,business_name")
      .single();
    if (error) throw new Error(error.message);
    await notify(supabase, row.user_id, "Your business needs revision", `${row.business_name}: ${data.reason}`);
    await audit(supabase, userId, "reject", row.id, { reason: data.reason });
    return row;
  });

export const suspendBusiness = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => RejectInput.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { data: row, error } = await supabase
      .from("businesses")
      .update({ approval_status: "suspended", rejection_reason: data.reason })
      .eq("id", data.id)
      .select("id,user_id,business_name")
      .single();
    if (error) throw new Error(error.message);
    await notify(supabase, row.user_id, "Your listing was suspended", `${row.business_name}: ${data.reason}`);
    await audit(supabase, userId, "suspend", row.id, { reason: data.reason });
    return row;
  });

export const reopenBusiness = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => IdInput.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { data: row, error } = await supabase
      .from("businesses")
      .update({ approval_status: "pending", rejection_reason: null })
      .eq("id", data.id)
      .select("id,user_id,business_name")
      .single();
    if (error) throw new Error(error.message);
    await notify(supabase, row.user_id, "Your listing was reopened for review", `${row.business_name} is back in the queue.`);
    await audit(supabase, userId, "reopen", row.id, {});
    return row;
  });

export const adminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId, true);
    const statuses = ["pending", "approved", "rejected", "suspended"] as const;
    const counts: Record<string, number> = {};
    for (const s of statuses) {
      const { count } = await supabase.from("businesses").select("id", { count: "exact", head: true }).eq("approval_status", s);
      counts[s] = count ?? 0;
    }
    const { data: byLga } = await supabase.from("businesses").select("lga").eq("approval_status", "approved");
    const lgaCount: Record<string, number> = {};
    (byLga ?? []).forEach((r: { lga: string }) => { lgaCount[r.lga] = (lgaCount[r.lga] ?? 0) + 1; });
    const { data: byCat } = await supabase.from("businesses").select("category").eq("approval_status", "approved");
    const catCount: Record<string, number> = {};
    (byCat ?? []).forEach((r: { category: string }) => { catCount[r.category] = (catCount[r.category] ?? 0) + 1; });
    return { counts, lgaCount, catCount };
  });

export const listUsersWithRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { data: roles, error } = await supabase
      .from("user_roles")
      .select("user_id, role, assigned_lga, profiles!inner(id, full_name, phone, created_at)")
      .order("created_at", { ascending: false, foreignTable: "profiles" });
    if (error) {
      // fallback: separate fetch
      const { data: pr } = await supabase.from("profiles").select("id, full_name, phone, created_at").order("created_at", { ascending: false });
      const { data: ur } = await supabase.from("user_roles").select("user_id, role, assigned_lga");
      const byUser: Record<string, string[]> = {};
      (ur ?? []).forEach((r: any) => { (byUser[r.user_id] ??= []).push(r.role); });
      return (pr ?? []).map((p: any) => ({ id: p.id, full_name: p.full_name, phone: p.phone, created_at: p.created_at, roles: byUser[p.id] ?? [] }));
    }
    const map = new Map<string, any>();
    (roles ?? []).forEach((r: any) => {
      const p = r.profiles;
      if (!p) return;
      const cur = map.get(p.id) ?? { id: p.id, full_name: p.full_name, phone: p.phone, created_at: p.created_at, roles: [] };
      cur.roles.push(r.role);
      map.set(p.id, cur);
    });
    return Array.from(map.values());
  });

const RoleInput = z.object({
  user_id: z.string().uuid(),
  role: z.enum(["business_owner", "lga_moderator", "state_admin", "super_admin"]),
  assigned_lga: z.string().max(80).optional().nullable(),
});

export const assignRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => RoleInput.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // Only super_admin can assign roles (RLS enforces too)
    const { error } = await supabase.from("user_roles").insert({ user_id: data.user_id, role: data.role, assigned_lga: data.assigned_lga ?? null });
    if (error) throw new Error(error.message);
    await audit(supabase, userId, "assign_role", data.user_id, { role: data.role, lga: data.assigned_lga });
    return { ok: true };
  });

const RemoveRoleInput = z.object({ user_id: z.string().uuid(), role: z.enum(["business_owner", "lga_moderator", "state_admin", "super_admin"]) });
export const removeRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => RemoveRoleInput.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("user_roles").delete().eq("user_id", data.user_id).eq("role", data.role);
    if (error) throw new Error(error.message);
    await audit(supabase, userId, "remove_role", data.user_id, { role: data.role });
    return { ok: true };
  });

export const getMyRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase.from("user_roles").select("role,assigned_lga").eq("user_id", userId);
    return (data ?? []).map((r: { role: string; assigned_lga: string | null }) => r);
  });
