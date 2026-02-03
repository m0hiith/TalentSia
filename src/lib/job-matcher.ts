
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "@/lib/supabase";

const getGenAI = () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        console.error("VITE_GEMINI_API_KEY is missing in .env");
        return null;
    }
    return new GoogleGenerativeAI(apiKey);
};

const GENERATION_CONFIG = {
    temperature: 0.0,
    topK: 32,
    topP: 1,
    maxOutputTokens: 4096,
};

export interface JobMatchResult {
    matchScore: number;
    matchedKeywords: string[];
    missingKeywords: string[];
    recommendedChanges: string[];
    keywordDensity: Record<string, number>;
    error?: string;
}

export const matchResumeToJob = async (resumeText: string, jobDescription: string): Promise<JobMatchResult> => {
    const genAI = getGenAI();
    if (!genAI) {
        return {
            matchScore: 0,
            matchedKeywords: [],
            missingKeywords: [],
            recommendedChanges: [],
            keywordDensity: {},
            error: "API Key missing"
        };
    }

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest", generationConfig: GENERATION_CONFIG });

    const prompt = `
    Act as an expert ATS (Applicant Tracking System).
    Compare the following RESUME TEXT against the JOB DESCRIPTION.

    Analyze strictly for:
    1. Keyword Matching (Hard skills, Soft skills, Tools).
    2. Relevance of experience.

    JOB DESCRIPTION:
    "${jobDescription.slice(0, 3000)}"

    RESUME TEXT:
    "${resumeText.slice(0, 3000)}"

    Output a STRICT JSON object with this exact schema:
    {
        "matchScore": number (0-100),
        "matchedKeywords": ["string", "string"],
        "missingKeywords": ["string", "string"],
        "recommendedChanges": ["string", "string"],
        "keywordDensity": { "keyword": count }
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed: JobMatchResult = JSON.parse(text);

        // Save to Database
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            await supabase.from('job_matches').insert({
                user_id: session.user.id,
                job_description: jobDescription,
                match_score: parsed.matchScore,
                matched_keywords: parsed.matchedKeywords,
                missing_keywords: parsed.missingKeywords,
                recommendations: parsed.recommendedChanges,
                keyword_density: parsed.keywordDensity
            });
        }

        return parsed;

    } catch (error: any) {
        console.error("Job Match Analysis Failed:", error);
        return {
            matchScore: 0,
            matchedKeywords: [],
            missingKeywords: [],
            recommendedChanges: [],
            keywordDensity: {},
            error: "Analysis failed"
        };
    }
};
