import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { questionLabelById } from "@/lib/questions";

export const runtime = "nodejs";

function esc(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatValue(value: unknown) {
  if (Array.isArray(value)) return value.map(esc).join(", ");
  return esc(value);
}

function brandDnaHtml(dna: any) {
  if (!dna) return "<p><em>Brand DNA se nepodařilo vygenerovat.</em></p>";
  const list = (items?: unknown[]) => `<ul>${(items || []).map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;
  const values = (dna.values || []).map((v: any) => `<li><strong>${esc(v.name)}</strong> — ${esc(v.explanation)}</li>`).join("");
  const structure = (dna.websiteStructure || []).map((v: any) => `<li><strong>${esc(v.title)}</strong> — ${esc(v.purpose)}</li>`).join("");
  return `
    <h2>AI Brand DNA</h2>
    <h3>Esence značky</h3><p>${esc(dna.essence)}</p>
    <h3>Positioning</h3><p>${esc(dna.positioning)}</p>
    <h3>Cílové skupiny</h3>${list(dna.primaryAudiences)}${list(dna.secondaryAudiences)}
    <h3>Potřeby zákazníků</h3>${list(dna.customerNeeds)}
    <h3>Hodnotová nabídka</h3><p>${esc(dna.valueProposition)}</p>
    <h3>Hodnoty</h3><ul>${values}</ul>
    <h3>Osobnost</h3>${list(dna.personality)}
    <h3>Značka je</h3>${list(dna.brandIs)}
    <h3>Značka není</h3>${list(dna.brandIsNot)}
    <h3>Archetyp</h3><p><strong>${esc(dna.archetype?.primary)}</strong> / ${esc(dna.archetype?.secondary)} — ${esc(dna.archetype?.rationale)}</p>
    <h3>Tone of Voice</h3>${list(dna.toneOfVoice?.principles)}<p><strong>Vyhnout se:</strong></p>${list(dna.toneOfVoice?.avoid)}<p><strong>Příklady:</strong></p>${list(dna.toneOfVoice?.examples)}
    <h3>Elevator pitch</h3><p>${esc(dna.elevatorPitch)}</p>
    <h3>Headline / claimy</h3>${list(dna.headlines)}
    <h3>Vizuální směr</h3>${list(dna.visualDirection)}
    <h3>Odlišení</h3>${list(dna.differentiation)}
    <h3>Důkazní body</h3>${list(dna.proofPoints)}
    <h3>Doporučená struktura webu</h3><ul>${structure}</ul>
    <h3>CTA</h3><p><strong>Primární:</strong> ${esc(dna.primaryCTA)}<br/><strong>Sekundární:</strong> ${esc(dna.secondaryCTA)}</p>
    <h3>Obsahové priority</h3>${list(dna.contentPriorities)}
    <h3>SEO témata</h3>${list(dna.seoThemes)}
    <h3>Marketingové příležitosti</h3>${list(dna.marketingOpportunities)}
    <h3>Mezery a rizika</h3>${list(dna.gapsAndRisks)}
    <h3>Dlouhodobá správa</h3>${list(dna.longTermCare)}
  `;
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { meta, answers, brandDna } = payload;
    if (!meta?.companyName || !meta?.contactName || !meta?.email) {
      return NextResponse.json({ error: "Chybí základní kontaktní údaje." }, { status: 400 });
    }

    let stored = false;
    let databaseError: string | null = null;
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
          auth: { persistSession: false },
        });
        const { error } = await supabase.from("briefings").insert({
          company_name: meta.companyName,
          contact_name: meta.contactName,
          contact_email: meta.email,
          contact_phone: meta.phone || null,
          website: meta.website || null,
          responses: answers || {},
          brand_dna: brandDna || null,
          email_status: "pending",
        });
        if (error) throw error;
        stored = true;
      } catch (e) {
        databaseError = e instanceof Error ? e.message : "Databázové uložení selhalo.";
        console.error(databaseError);
      }
    }

    let emailed = false;
    let emailError: string | null = null;
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const rows = Object.entries(answers || {}).map(([key, value]) => `
          <tr>
            <td style="padding:10px;border-bottom:1px solid #eee;font-weight:600;vertical-align:top;">${esc(questionLabelById[key] || key)}</td>
            <td style="padding:10px;border-bottom:1px solid #eee;vertical-align:top;">${formatValue(value)}</td>
          </tr>`).join("");
        const to = process.env.BRIEFING_RECIPIENT_EMAIL || "petr.holec13@gmail.com";
        const from = process.env.RESEND_FROM || "SkočDál Briefing <onboarding@resend.dev>";
        const subject = `SkočDál briefing — ${meta.companyName} — ${meta.contactName}`;
        const html = `
          <div style="font-family:Arial,sans-serif;color:#111;max-width:900px;margin:auto;line-height:1.5">
            <div style="background:#111;color:#f7f6f1;padding:24px 28px;border-top:8px solid #FFD400">
              <h1 style="margin:0">SkočDál — nový briefing</h1>
              <p style="margin:6px 0 0">${esc(meta.companyName)}</p>
            </div>
            <div style="padding:24px 28px">
              <h2>Kontakt</h2>
              <p><strong>${esc(meta.contactName)}</strong><br/>${esc(meta.email)}<br/>${esc(meta.phone)}<br/>${esc(meta.website)}</p>
              <h2>Odpovědi</h2>
              <table style="border-collapse:collapse;width:100%">${rows}</table>
              ${brandDnaHtml(brandDna)}
              <p style="margin-top:30px;color:#666">Odesláno ${new Date().toLocaleString("cs-CZ", { timeZone: "Europe/Prague" })}</p>
            </div>
          </div>`;

        const { error } = await resend.emails.send({ from, to, subject, html });
        if (error) throw new Error(error.message);
        emailed = true;
      } catch (e) {
        emailError = e instanceof Error ? e.message : "Odeslání e-mailu selhalo.";
        console.error(emailError);
      }
    }

    return NextResponse.json({ stored, emailed, databaseError, emailError });
  } catch (error) {
    console.error("Submit error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Odeslání briefingu selhalo." }, { status: 500 });
  }
}
