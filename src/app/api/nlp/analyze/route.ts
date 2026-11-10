import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { nlpService } from "@/lib/nlp/service";

const analyzeSchema = z.object({
  message: z.string().min(3, "Incident description must be at least 3 characters.").max(3000, "Message exceeds 3000 characters limit."),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = analyzeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const result = await nlpService.analyze(parsed.data.message);
    return NextResponse.json(result);
  } catch (error) {
    console.error("NLP Analysis API error:", error);
    return NextResponse.json(
      { error: "Failed to process emergency description through NLP engine." },
      { status: 500 }
    );
  }
}
