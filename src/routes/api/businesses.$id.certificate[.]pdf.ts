import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { generateCertificatePdf } from "@/lib/certificate-pdf.server";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/api/businesses/$id/certificate.pdf")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const id = params.id;
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
          return new Response("Invalid ID", { status: 400 });
        }

        // Require Bearer token + ownership
        const authHeader = request.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
          return new Response("Unauthorized", { status: 401 });
        }
        const token = authHeader.slice(7);
        const SUPABASE_URL = process.env.SUPABASE_URL!;
        const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY!;
        const sb = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
        });
        const { data: claims } = await sb.auth.getClaims(token);
        const userId = claims?.claims?.sub;
        if (!userId) return new Response("Unauthorized", { status: 401 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: biz, error } = await supabaseAdmin
          .from("businesses")
          .select("id,user_id,business_name,category,lga,community,registry_id,approved_at,approval_status")
          .eq("id", id)
          .maybeSingle();
        if (error || !biz) return new Response("Not found", { status: 404 });
        if (biz.approval_status !== "approved") return new Response("Not available", { status: 403 });
        if (biz.user_id !== userId) return new Response("Forbidden", { status: 403 });

        const origin = new URL(request.url).origin;
        const bytes = await generateCertificatePdf(biz, origin);
        return new Response(bytes, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${(biz.registry_id ?? biz.id).replace(/[^A-Za-z0-9_-]/g, "_")}.pdf"`,
            "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
            "Pragma": "no-cache",
            "Expires": "0",
          },
        });
      },
    },
  },
});
