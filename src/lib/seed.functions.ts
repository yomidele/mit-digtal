import { createServerFn } from "@tanstack/react-start";

const DEMO = [
  { email: "lga@demo.taraba.gov.ng", password: "Demo!Taraba2026", full_name: "Demo LGA Moderator", role: "lga_moderator", assigned_lga: "Jalingo" },
  { email: "state@demo.taraba.gov.ng", password: "Demo!Taraba2026", full_name: "Demo State Admin", role: "state_admin", assigned_lga: null },
  { email: "super@demo.taraba.gov.ng", password: "Demo!Taraba2026", full_name: "Demo Super Admin", role: "super_admin", assigned_lga: null },
];

export const seedDemoAdmins = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const results: Array<{ email: string; created: boolean; role: string }> = [];

  for (const u of DEMO) {
    // Check if already exists
    const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const existing = list?.users.find((x) => x.email?.toLowerCase() === u.email);
    let userId: string;
    let created = false;
    if (existing) {
      userId = existing.id;
    } else {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { full_name: u.full_name, phone: "+2348000000000" },
      });
      if (error) throw new Error(`${u.email}: ${error.message}`);
      userId = data.user.id;
      created = true;
    }

    // Ensure profile exists (trigger should have made it, but be safe)
    await supabaseAdmin.from("profiles").upsert({ id: userId, full_name: u.full_name, phone: "+2348000000000" }, { onConflict: "id" });

    // Ensure role
    const { data: roles } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId);
    const hasRole = (roles ?? []).some((r) => r.role === u.role);
    if (!hasRole) {
      await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: u.role, assigned_lga: u.assigned_lga });
    }
    results.push({ email: u.email, created, role: u.role });
  }
  return { results, password: DEMO[0].password };
});
