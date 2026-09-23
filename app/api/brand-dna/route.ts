import { NextResponse } from "next/server";
import OpenAI from "openai";
import { brandDnaJsonSchema } from "@/lib/brand-schema";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY není nastavený." }, { status: 503 });
    }

    const body = await request.json();
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5",
      instructions: [
        "Jsi senior brand stratég a webový stratég pro české malé a střední firmy.",
        "Z dodaného briefingu vytvoř hlubokou, konkrétní Brand DNA a doporučení pro web.",
        "Neopisuj pouze odpovědi. Hledej souvislosti, prioritizuj a vysvětluj, co z nich plyne.",
        "Nikdy nevymýšlej fakta o firmě. Pokud něco není uvedeno, označ to jako doporučení nebo mezeru k doplnění.",
        "SEO témata navrhuj podle služeb a lokality, ale nevymýšlej hledanost, pozice ani konkurenční data.",
        "Piš profesionální, přirozenou češtinou bez agenturních klišé.",
        "Headline a CTA musí vycházet z konkrétní firmy a její nabídky.",
      ].join("\n"),
      input: `BRIEFING:\n${JSON.stringify(body, null, 2)}`,
      text: {
        format: {
          type: "json_schema",
          name: "brand_dna",
          strict: true,
          schema: brandDnaJsonSchema,
        },
      } as any,
    });

    if (!response.output_text) {
      throw new Error("AI nevrátila textový výstup.");
    }

    const brandDna = JSON.parse(response.output_text);
    return NextResponse.json({ brandDna });
  } catch (error) {
    console.error("Brand DNA error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generování Brand DNA selhalo." },
      { status: 500 },
    );
  }
}
