// Supabase Edge Function: analyze a résumé with Gemini.
// The Gemini key lives here (server-side) — never in the browser bundle. (P2)
// Deploy:  supabase functions deploy analyze-resume
// Secret:  supabase secrets set GEMINI_API_KEY=...
import { createClient } from "npm:@supabase/supabase-js@2";
import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.24.1";
import { atsResultSchema } from "../_shared/ats-schema.ts";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

function buildPrompt(resumeText: string, targetRole: string): string {
  return `
You are a friendly career coach and ATS expert helping a job seeker improve their resume.
Analyze the following resume text against the target role(s): "${targetRole}".
Write feedback in a warm, encouraging, personalized tone — address the candidate as "you".

Return ONLY a JSON object with this exact shape:
{
  "basicInfo": { "fullName": "string or null", "email": "string or null", "skills": ["..."], "experience_years": 0, "education": "string", "job_titles": ["..."] },
  "score": 0,
  "matchedSkills": ["..."], "missingSkills": ["..."], "recommendedSkills": ["..."],
  "details": { "skillScore": 0, "experienceScore": 0, "roleScore": 0 },
  "summary": "2-3 sentences addressed to the candidate",
  "improvements": ["actionable tip", "...", "..."],
  "inferredInterests": ["..."]
}
All numeric scores are 0-100.

Resume Text:
${resumeText}
`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonResponse({ error: "Authentication required" }, 401);

    // User-scoped client: RLS ensures the upsert only touches this user's row.
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return jsonResponse({ error: "Invalid or expired session" }, 401);

    const body = await req.json().catch(() => null);
    const resumeText = body?.resumeText;
    const targetRole = body?.targetRole ?? "General Software Engineering";
    if (typeof resumeText !== "string" || !resumeText.trim()) {
      return jsonResponse({ error: "Resume text is required." }, 400);
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) return jsonResponse({ error: "AI service is not configured." }, 500);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 1,
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
      },
    });

    const result = await model.generateContent(buildPrompt(resumeText, targetRole));
    const text = result.response.text();

    let parsed: unknown;
    try {
      parsed = JSON.parse(text.replace(/```json/g, "").replace(/```/g, "").trim());
    } catch {
      return jsonResponse({ error: "The AI returned an unreadable response. Please try again." }, 502);
    }

    const validated = atsResultSchema.safeParse(parsed);
    if (!validated.success) {
      return jsonResponse({ error: "The AI response was incomplete. Please try again." }, 502);
    }
    const a = validated.data;

    await supabase.from("student_profiles").upsert({
      user_id: user.id,
      full_name: a.basicInfo.fullName ?? null,
      email: a.basicInfo.email ?? null,
      ats_score: a.score,
      experience_years: a.basicInfo.experience_years,
      skills_detected: a.basicInfo.skills,
      missing_skills: a.missingSkills,
      summary: a.summary,
      inferred_interests: a.inferredInterests,
    }, { onConflict: "user_id" });

    return jsonResponse({ ...a, fullText: resumeText }, 200);
  } catch (_err) {
    return jsonResponse({ error: "Something went wrong. Please try again." }, 500);
  }
});
