import { createFileRoute } from "@tanstack/react-router";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import tarabaCrestUrl from "@/assets/taraba-crest-sm.png?url";
import tarabaSealUrl from "@/assets/taraba-state-seal-sm.png?url";
import nigeriaWatermarkUrl from "@/assets/nigeria-coat-of-arms-watermark.png?url";

async function fetchPngBytes(assetUrl: string, requestUrl: string): Promise<Uint8Array | null> {
  try {
    const absolute = new URL(assetUrl, requestUrl).toString();
    const res = await fetch(absolute);
    if (!res.ok) return null;
    return new Uint8Array(await res.arrayBuffer());
  } catch {
    return null;
  }
}

export const Route = createFileRoute("/api/businesses/$id/certificate.pdf")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
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
        const helvO = await pdf.embedFont(StandardFonts.HelveticaOblique);

        const green = rgb(0.05, 0.32, 0.18);
        const greenDark = rgb(0.03, 0.22, 0.12);
        const gold = rgb(0.78, 0.58, 0.12);
        const goldLight = rgb(0.95, 0.85, 0.55);
        const ink = rgb(0.12, 0.16, 0.13);
        const muted = rgb(0.4, 0.4, 0.4);

        // Outer borders
        page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(1, 1, 1) });
        page.drawRectangle({ x: 18, y: 18, width: width - 36, height: height - 36, borderColor: green, borderWidth: 3 });
        page.drawRectangle({ x: 28, y: 28, width: width - 56, height: height - 56, borderColor: gold, borderWidth: 1 });

        // Fetch all images in parallel
        const [tarabaBytes, sealBytes, watermarkBytes] = await Promise.all([
          fetchPngBytes(tarabaCrestUrl, request.url),
          fetchPngBytes(tarabaSealUrl, request.url),
          fetchPngBytes(nigeriaWatermarkUrl, request.url),
        ]);

        // ===== BACKGROUND WATERMARK (Nigerian coat of arms, centered, transparent) =====
        if (watermarkBytes) {
          const wm = await pdf.embedPng(watermarkBytes);
          const wmSize = 340;
          const dims = wm.scaleToFit(wmSize, wmSize);
          page.drawImage(wm, {
            x: (width - dims.width) / 2,
            y: (height - dims.height) / 2 - 20,
            width: dims.width,
            height: dims.height,
          });
        }

        // ===== HEADER BAND =====
        const headerH = 96;
        const headerY = height - 28 - headerH;
        page.drawRectangle({ x: 28, y: headerY, width: width - 56, height: headerH, color: green });
        page.drawRectangle({ x: 28, y: headerY, width: width - 56, height: 4, color: gold });

        const logoSize = 78;
        const logoY = headerY + (headerH - logoSize) / 2;
        // Left logo — Made-in-Taraba (taraba crest)
        if (tarabaBytes) {
          const img = await pdf.embedPng(tarabaBytes);
          const dims = img.scaleToFit(logoSize, logoSize);
          page.drawImage(img, {
            x: 48 + (logoSize - dims.width) / 2,
            y: logoY + (logoSize - dims.height) / 2,
            width: dims.width,
            height: dims.height,
          });
        }
        // Right logo — Taraba State Government seal
        if (sealBytes) {
          const img = await pdf.embedPng(sealBytes);
          const dims = img.scaleToFit(logoSize, logoSize);
          page.drawImage(img, {
            x: width - 48 - logoSize + (logoSize - dims.width) / 2,
            y: logoY + (logoSize - dims.height) / 2,
            width: dims.width,
            height: dims.height,
          });
        }

        // Header text (centered between logos)
        const headerTopY = headerY + headerH - 30;
        const t1 = "FEDERAL REPUBLIC OF NIGERIA";
        const t1W = helvR.widthOfTextAtSize(t1, 11);
        page.drawText(t1, { x: (width - t1W) / 2, y: headerTopY, size: 11, font: helvR, color: goldLight });

        const t2 = "TARABA STATE GOVERNMENT";
        const t2W = helv.widthOfTextAtSize(t2, 18);
        page.drawText(t2, { x: (width - t2W) / 2, y: headerTopY - 22, size: 18, font: helv, color: rgb(1, 1, 1) });

        const t3 = "Made-in-Taraba Digital Business Registry";
        const t3W = helvO.widthOfTextAtSize(t3, 11);
        page.drawText(t3, { x: (width - t3W) / 2, y: headerTopY - 40, size: 11, font: helvO, color: goldLight });

        // ===== CERTIFICATE TITLE =====
        const titleY = headerY - 44;
        const title = "CERTIFICATE OF REGISTRATION";
        const titleW = helv.widthOfTextAtSize(title, 24);
        page.drawText(title, { x: (width - titleW) / 2, y: titleY, size: 24, font: helv, color: green });
        page.drawLine({ start: { x: width / 2 - 120, y: titleY - 8 }, end: { x: width / 2 + 120, y: titleY - 8 }, thickness: 1, color: gold });

        // ===== PREAMBLE =====
        const pre = "This is to certify that";
        const preW = helvR.widthOfTextAtSize(pre, 12);
        page.drawText(pre, { x: (width - preW) / 2, y: titleY - 34, size: 12, font: helvR, color: ink });

        // ===== BUSINESS NAME (auto-scaled) =====
        const name = biz.business_name.toUpperCase();
        let nameSize = 28;
        while (helv.widthOfTextAtSize(name, nameSize) > width - 180 && nameSize > 14) nameSize -= 1;
        const nameW = helv.widthOfTextAtSize(name, nameSize);
        const nameY = titleY - 70;
        page.drawText(name, { x: (width - nameW) / 2, y: nameY, size: nameSize, font: helv, color: gold });

        // ===== BODY =====
        const body1 = `is officially registered in the ${biz.category} sector of the`;
        const body1W = helvR.widthOfTextAtSize(body1, 11);
        page.drawText(body1, { x: (width - body1W) / 2, y: nameY - 26, size: 11, font: helvR, color: ink });

        const body2 = `Made-in-Taraba Digital Registry, operating from ${biz.community}, ${biz.lga} LGA.`;
        const body2W = helvR.widthOfTextAtSize(body2, 11);
        page.drawText(body2, { x: (width - body2W) / 2, y: nameY - 42, size: 11, font: helvR, color: ink });

        // ===== DETAIL ROW — Registry ID (left) | Date (right) =====
        const detailY = 140;
        const colLeftX = 90;
        const colRightX = width - 90;

        page.drawText("REGISTRY ID", { x: colLeftX, y: detailY + 20, size: 9, font: helv, color: muted });
        const regId = biz.registry_id ?? "—";
        page.drawText(regId, { x: colLeftX, y: detailY, size: 15, font: helv, color: greenDark });

        const dateLabel = "DATE OF APPROVAL";
        const dateLabelW = helv.widthOfTextAtSize(dateLabel, 9);
        page.drawText(dateLabel, { x: colRightX - dateLabelW, y: detailY + 20, size: 9, font: helv, color: muted });
        const date = biz.approved_at
          ? new Date(biz.approved_at).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
          : "—";
        const dateW = helv.widthOfTextAtSize(date, 13);
        page.drawText(date, { x: colRightX - dateW, y: detailY, size: 13, font: helv, color: greenDark });

        // ===== SIGNATURE BLOCK (centered, well below detail row) =====
        const sigY = 70;
        page.drawLine({ start: { x: width / 2 - 110, y: sigY + 16 }, end: { x: width / 2 + 110, y: sigY + 16 }, thickness: 0.8, color: ink });
        const sigName = "Authorised Signatory";
        const sigNameW = helv.widthOfTextAtSize(sigName, 10);
        page.drawText(sigName, { x: (width - sigNameW) / 2, y: sigY, size: 10, font: helv, color: ink });
        const sigSub = "Ministry of Commerce & Industry, Taraba State";
        const sigSubW = helvR.widthOfTextAtSize(sigSub, 9);
        page.drawText(sigSub, { x: (width - sigSubW) / 2, y: sigY - 12, size: 9, font: helvR, color: muted });

        // ===== FOOTER =====
        const verify = `Verify this certificate at: /business/${biz.id}`;
        page.drawText(verify, { x: 40, y: 36, size: 8, font: helvR, color: muted });

        const bytes = await pdf.save();
        return new Response(new Uint8Array(bytes), {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${(biz.registry_id ?? biz.id).replace(/[^A-Za-z0-9_-]/g, "_")}.pdf"`,
            "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
            "Pragma": "no-cache",
            "Expires": "0",
          },
        });
      },
    },
  },
});
