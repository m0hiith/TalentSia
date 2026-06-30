// Supabase Edge Function: generate a cover letter with Gemini (server-side key). (P2)
// Deploy:  supabase functions deploy generate-cover-letter
import { createClient } from "npm:@supabase/supabase-js@2";
import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.24.1";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

function buildPrompt(resumeContext: string, jobDescription: string, companyName: string): string {
  return `
You are a professional cover letter writer. Write a compelling, personalized cover letter.

CANDIDATE PROFILE:
${resumeContext}

JOB DESCRIPTION:
${jobDescription}

${companyName ? `COMPANY NAME: ${companyName}` : ""}

INSTRUCTIONS:
1. 3-4 paragraphs, professional but warm tone.
2. Highlight relevant skills/experience matching the job.
3. No placeholder brackets; use the company name if provided.
4. No date/address headers — just the letter body.
5. Start "Dear Hiring Manager," and end with "Sincerely," + the candidate's name.

Write the cover letter now:
`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonResponse({ error: "Authentication required" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return jsonResponse({ error: "Invalid or expired session" }, 401);

    const body = await req.json().catch(() => null);
    const resumeContext = body?.resumeContext;
    const jobDescription = body?.jobDescription;
    const companyName = body?.companyName ?? "";
    if (typeof resumeContext !== "string" || typeof jobDescription !== "string" || !jobDescription.trim()) {
      return jsonResponse({ error: "A résumé and a job description are required." }, 400);
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) return jsonResponse({ error: "AI service is not configured." }, 500);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      generationConfig: { temperature: 0.7, topK: 40, topP: 1, maxOutputTokens: 2048 },
    });

    const result = await model.generateContent(buildPrompt(resumeContext, jobDescription, companyName));
    const coverLetter = result.response.text();
    if (!coverLetter.trim()) {
      return jsonResponse({ error: "The AI returned an empty response. Please try again." }, 502);
    }

    return jsonResponse({ coverLetter }, 200);
  } catch (_err) {
    return jsonResponse({ error: "Something went wrong. Please try again." }, 500);
  }
});
