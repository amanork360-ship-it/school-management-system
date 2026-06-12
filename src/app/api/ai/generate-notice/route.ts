import OpenAI from "openai";
import { NextResponse } from "next/server";

interface RequestBody {
  input: string;
}

interface NoticeResponse {
  notice: string;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "missing_key",
});

import { createSupabaseServerClient } from "../../../../lib/supabase-server";

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { input }: RequestBody = await req.json();
    if (!input?.trim()) {
      return NextResponse.json({ error: "Input cannot be empty" }, { status: 400 });
    }

    const prompt = `You are a professional school administrator.

Convert the provided information into a formal school notice.

Information:
${input}

Requirements:
- Create a professional title
- Use clear and formal language
- Organize the content properly
- Include date and event details when available
- Include a professional closing statement
- Format the notice so it is ready to publish`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const notice = completion.choices?.[0]?.message?.content?.trim() || "";
    if (!notice) {
      return NextResponse.json({ error: "Failed to generate notice" }, { status: 500 });
    }

    const response: NoticeResponse = { notice };
    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error generating notice:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
