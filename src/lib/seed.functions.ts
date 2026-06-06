import { createServerFn } from "@tanstack/react-start";

type AppRole = "business_owner" | "lga_moderator" | "state_admin" | "super_admin";
const DEMO: Array<{ email: string; password: string; full_name: string; role: AppRole; assigned_lga: string | null }> = [
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

const DEMO_OWNER = {
  email: "yomi.dele@demo.taraba.gov.ng",
  password: "Demo!Taraba2026",
  full_name: "Yomi Dele",
  phone: "+2348031234567",
};

export const seedDemoBusinessOwner = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // 1. Ensure auth user exists
  const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
  let userId: string;
  const existing = list?.users.find((x) => x.email?.toLowerCase() === DEMO_OWNER.email);
  if (existing) {
    userId = existing.id;
  } else {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: DEMO_OWNER.email,
      password: DEMO_OWNER.password,
      email_confirm: true,
      user_metadata: { full_name: DEMO_OWNER.full_name, phone: DEMO_OWNER.phone },
    });
    if (error) throw new Error(error.message);
    userId = data.user.id;
  }

  // 2. Profile
  await supabaseAdmin
    .from("profiles")
    .upsert({ id: userId, full_name: DEMO_OWNER.full_name, phone: DEMO_OWNER.phone }, { onConflict: "id" });

  // 3. Ensure business_owner role
  const { data: roles } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId);
  if (!(roles ?? []).some((r) => r.role === "business_owner")) {
    await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: "business_owner" });
  }

  // 4. Ensure an approved Agriculture business
  const { data: existingBiz } = await supabaseAdmin
    .from("businesses")
    .select("id,approval_status")
    .eq("user_id", userId)
    .maybeSingle();

  const bizPayload = {
    user_id: userId,
    business_name: "Dele Family Farms",
    category: "Agriculture",
    sub_sector: "Rice & Grains",
    products_services:
      "Premium long-grain rice, maize, and millet cultivated on 40 hectares in the Mambilla plateau region. Supplies wholesale buyers, schools, and retail markets across northern Nigeria.",
    ownership_structure: "Sole Proprietorship",
    registration_status: "CAC Registered",
    cac_number: "RC-2034981",
    operational_status: "Active",
    lga: "Sardauna",
    community: "Gembu",
    address: "Plot 14, Mambilla Road, Gembu, Sardauna LGA, Taraba State",
    business_phone: DEMO_OWNER.phone,
    business_email: "farms@deledemo.taraba.ng",
    website: "https://delefarms.example.ng",
    employee_count: "11-50",
    production_capacity: "120 tonnes of paddy rice per harvest cycle",
    market_reach: "National",
    key_markets: "Jalingo, Yola, Jos, Abuja, Kano",
    certifications: ["NAFDAC Certified", "SON Quality Mark"],
    export_readiness: "In Progress",
    financing_needs: "Seeking ₦25M working capital for mill expansion",
    logo_url: null,
    image_urls: [],
    document_urls: [],
  };

  let bizId: string;
  if (existingBiz) {
    bizId = existingBiz.id;
    await supabaseAdmin.from("businesses").update(bizPayload).eq("id", bizId);
  } else {
    const { data: inserted, error } = await supabaseAdmin
      .from("businesses")
      .insert({ ...bizPayload, approval_status: "pending" })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    bizId = inserted.id;
  }

  // 5. Approve so the trigger generates a registry_id + approved_at
  const { data: approved, error: approveErr } = await supabaseAdmin
    .from("businesses")
    .update({ approval_status: "approved", approved_by: userId })
    .eq("id", bizId)
    .select("id,registry_id,approval_status")
    .single();
  if (approveErr) throw new Error(approveErr.message);

  return {
    email: DEMO_OWNER.email,
    password: DEMO_OWNER.password,
    business_id: approved.id,
    registry_id: approved.registry_id,
  };
});
