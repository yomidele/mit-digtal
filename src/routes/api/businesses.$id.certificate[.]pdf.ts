import { createFileRoute } from "@tanstack/react-router";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export const Route = createFileRoute("/api/businesses/$id/certificate.pdf")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const id = params.id;
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
          return new Response("Invalid ID", { status: 400 });
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: biz, error } = await supabaseAdmin
          .from("businesses")
          .select("id,business_name,category,sub_sector,lga,community,registry_id,approved_at,approval_status,ownership_structure")
          .eq("id", id)
          .eq("approval_status", "approved")
          .maybeSingle();
        if (error || !biz) return new Response("Not found", { status: 404 });

        const pdf = await PDFDocument.create();
        const page = pdf.addPage([842, 595]); // A4 landscape
        const { width, height } = page.getSize();
        const helv = await pdf.embedFont(StandardFonts.HelveticaBold);
        const helvR = await pdf.embedFont(StandardFonts.Helvetica);

        const green = rgb(0.05, 0.32, 0.18);
        const gold = rgb(0.78, 0.58, 0.12);
        const ink = rgb(0.12, 0.16, 0.13);

        // Background border
        page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(1, 1, 1) });
        page.drawRectangle({ x: 20, y: 20, width: width - 40, height: height - 40, borderColor: green, borderWidth: 3 });
        page.drawRectangle({ x: 32, y: 32, width: width - 64, height: height - 64, borderColor: gold, borderWidth: 1 });

        // Header band
        page.drawRectangle({ x: 32, y: height - 110, width: width - 64, height: 78, color: green });
        const headerTitle = "TARABA STATE GOVERNMENT";
        const headerTitleW = helv.widthOfTextAtSize(headerTitle, 18);
        page.drawText(headerTitle, { x: (width - headerTitleW) / 2, y: height - 60, size: 18, font: helv, color: rgb(1, 1, 1) });
        const sub = "Made-in-Taraba Digital Registry";
        const subW = helvR.widthOfTextAtSize(sub, 12);
        page.drawText(sub, { x: (width - subW) / 2, y: height - 82, size: 12, font: helvR, color: rgb(0.95, 0.85, 0.55) });

        // Certificate title
        const t1 = "CERTIFICATE OF REGISTRATION";
        const t1W = helv.widthOfTextAtSize(t1, 28);
        page.drawText(t1, { x: (width - t1W) / 2, y: height - 170, size: 28, font: helv, color: green });

        const t2 = "This is to certify that";
        const t2W = helvR.widthOfTextAtSize(t2, 14);
        page.drawText(t2, { x: (width - t2W) / 2, y: height - 215, size: 14, font: helvR, color: ink });

        // Business name
        const name = biz.business_name.toUpperCase();
        const maxNameSize = 32;
        let nameSize = maxNameSize;
        while (helv.widthOfTextAtSize(name, nameSize) > width - 140 && nameSize > 14) nameSize -= 1;
        const nameW = helv.widthOfTextAtSize(name, nameSize);
        page.drawText(name, { x: (width - nameW) / 2, y: height - 260, size: nameSize, font: helv, color: gold });

        // Underline accent
        page.drawLine({ start: { x: width / 2 - 100, y: height - 275 }, end: { x: width / 2 + 100, y: height - 275 }, thickness: 1.5, color: gold });

        // Body
        const body1 = `is officially registered in the ${biz.category} sector of`;
        const body1W = helvR.widthOfTextAtSize(body1, 13);
        page.drawText(body1, { x: (width - body1W) / 2, y: height - 305, size: 13, font: helvR, color: ink });

        const body2 = `the Made-in-Taraba Digital Registry, operating from ${biz.community}, ${biz.lga} LGA.`;
        const body2W = helvR.widthOfTextAtSize(body2, 13);
        page.drawText(body2, { x: (width - body2W) / 2, y: height - 325, size: 13, font: helvR, color: ink });

        // Registry ID box
        const idLabel = "REGISTRY ID";
        page.drawText(idLabel, { x: width / 2 - 130, y: 200, size: 10, font: helvR, color: ink });
        const regId = biz.registry_id ?? "—";
        page.drawText(regId, { x: width / 2 - 130, y: 178, size: 18, font: helv, color: green });

        const dateLabel = "DATE OF APPROVAL";
        page.drawText(dateLabel, { x: width / 2 + 20, y: 200, size: 10, font: helvR, color: ink });
        const date = biz.approved_at ? new Date(biz.approved_at).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) : "—";
        page.drawText(date, { x: width / 2 + 20, y: 178, size: 14, font: helv, color: green });

        // Signature line
        page.drawLine({ start: { x: width / 2 - 90, y: 100 }, end: { x: width / 2 + 90, y: 100 }, thickness: 0.8, color: ink });
        const sig = "Authorised Signatory — Taraba State Government";
        const sigW = helvR.widthOfTextAtSize(sig, 10);
        page.drawText(sig, { x: (width - sigW) / 2, y: 86, size: 10, font: helvR, color: ink });

        const footer = `Verify at: /business/${biz.id}`;
        page.drawText(footer, { x: 40, y: 40, size: 8, font: helvR, color: rgb(0.4, 0.4, 0.4) });

        const bytes = await pdf.save();
        return new Response(new Uint8Array(bytes), {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${(biz.registry_id ?? biz.id).replace(/[^A-Za-z0-9_-]/g, "_")}.pdf"`,
            "Cache-Control": "public, max-age=300",
          },
        });
      },
    },
  },
});
