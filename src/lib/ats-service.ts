import { GoogleGenerativeAI } from "@google/generative-ai";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";
import { ResumeData } from "@/store/resumeStore";
import { supabase } from "@/lib/supabase";

// Initialize Gemini
// Note: This requires VITE_GEMINI_API_KEY in .env
const getGenAI = () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        console.error("VITE_GEMINI_API_KEY is missing in .env");
        return null;
    }
    return new GoogleGenerativeAI(apiKey);
};

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export interface ATSResult {
    basicInfo: {
        fullName?: string;
        email?: string;
        skills: string[];
        experience_years: number;
        education: string;
        job_titles: string[];
    };
    score: number;
    matchedSkills: string[];
    missingSkills: string[];
    recommendedSkills: string[];
    details: {
        skillScore: number;
        experienceScore: number;
        roleScore: number;
    };
    summary: string; // New field for the final verdict
    improvements: string[]; // for suggestions
    inferredInterests?: string[]; // Optional field for classified interests
    databaseStatus?: { success: boolean; message: string }; // Debug info
    fullText?: string; // Captured text
}

// Helper: Extract text from PDF
const extractTextFromPdf = async (file: File): Promise<string> => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(" ");
            fullText += pageText + "\n";
        }
        return fullText;
    } catch (error) {
        console.error("Error extracting PDF text:", error);
        throw new Error("Failed to extract text from PDF");
    }
};

// Helper: Extract text from DOCX
const extractTextFromDocx = async (file: File): Promise<string> => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
    } catch (error) {
        console.error("Error extracting DOCX text:", error);
        throw new Error("Failed to extract text from DOCX");
    }
};

// Old interface compatibility adapter
// The UI likely expects these precise fields.
// We will ask Gemini to JSON output in this structure.
const GENERATION_CONFIG = {
    temperature: 0.4,
    topK: 32,
    topP: 1,
    maxOutputTokens: 4096,
};

export const analyzeResume = async (resume: ResumeData, file?: File): Promise<ATSResult> => {
    // If no file is provided (e.g. only manual data), fallback to previous logic or simple string dump
    // But strictly, for this new logic, we prefer the file.
    // If the user hasn't selected a file but has filled out the form, we can try to construct a "text" representation.

    let resumeText = "";

    if (file) {
        const ext = file.name.split(".").pop()?.toLowerCase();
        if (ext === "pdf") {
            resumeText = await extractTextFromPdf(file);
        } else if (ext === "docx") {
            resumeText = await extractTextFromDocx(file);
        } else {
            // Fallback or error?
            console.warn("Unsupported file type, trying text extraction anyway", ext);
        }
    }

    // If we couldn't get text from file (or no file), use the structured data
    if (!resumeText.trim()) {
        resumeText = `
      Skills: ${resume.skills.join(", ")}
      Experience Years: ${resume.experience_years}
      Job Titles: ${resume.job_titles?.join(", ")}
      Interests: ${resume.interests?.join(", ")}
      `;
    }

    const genAI = getGenAI();
    if (!genAI) {
        // Return a dummy failure object if API key is missing
        return {
            basicInfo: {
                fullName: "Error",
                email: "",
                skills: [],
                experience_years: 0,
                education: "Error",
                job_titles: []
            },
            score: 0,
            matchedSkills: [],
            missingSkills: ["API Key Missing"],
            recommendedSkills: [],
            details: { skillScore: 0, experienceScore: 0, roleScore: 0 },
            summary: "Please add VITE_GEMINI_API_KEY to your .env file.",
            improvements: []
        };
    }

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest", generationConfig: GENERATION_CONFIG });

    // We can inject a "Job Description" if one existed in the state, but the current analyzeResume signature 
    // only takes ResumeData. We might need to assume the "Interests" act as the target role context.
    const targetRole = resume.interests?.join(", ") || "General Software Engineering";

    const prompt = `
    You are a friendly career coach and ATS (Applicant Tracking System) expert helping a job seeker improve their resume.
    
    Your task is to analyze the following resume text against the target role(s): "${targetRole}".
    
    IMPORTANT: Write your feedback in a warm, encouraging, and personalized tone. Address the candidate directly using "you" and "your". Be specific and actionable. Avoid generic phrases.
    
    Output a strictly valid JSON object. Do not include any markdown formatting (like \`\`\`json).
    The JSON must match this structure EXACTLY:
    
    {
        "basicInfo": {
            "fullName": "Extracted Name or 'Candidate'",
            "email": "Extracted Email or null",
            "skills": ["Extracted Skill 1", "Extracted Skill 2"],
            "experience_years": number (total years of experience),
            "education": "Highest Degree / Major",
            "job_titles": ["Most Critical Job Title 1", "Most Critical Job Title 2"]
        },
        "score": number (0-100),
        "matchedSkills": ["skill from resume that matches target role"],
        "missingSkills": ["important skill for target role missing in resume"],
        "recommendedSkills": ["skill recommended to learn"],
        "details": {
            "skillScore": number (0-100),
            "experienceScore": number (0-100),
            "roleScore": number (0-100)
        },
        "summary": "A personalized 2-3 sentence summary written TO the candidate. Start with something like 'Great job!' or 'Your resume shows...' and address them directly. Be encouraging but honest about areas to improve.",
        "improvements": [
            "Start each improvement with 'You should...' or 'Consider...' or 'Try adding...' - be specific and actionable",
            "Second personalized improvement tip addressing the candidate directly",
            "Third personalized improvement tip with specific examples when possible"
        ]
    }

    Remember: 
    - All text in "summary" and "improvements" should feel like a coach talking TO the candidate, not about them
    - Use encouraging language like "You've done well with...", "Your experience in X is valuable...", "To stand out more, you could..."
    - Be specific - mention actual skills or experiences from their resume when giving feedback

    Resume Text:
    ${resumeText}
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Clean up markdown code blocks if present (just in case)
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        // Attempt to parse JSON
        const parsed: ATSResult = JSON.parse(text);

        // --- DATABASE SAVE START ---
        // Save to Supabase
        // We import supabase from lib to ensure we use the same client
        const { data: { session } } = await supabase.auth.getSession();
        let dbStatus = { success: false, message: "User not logged in" };

        if (session?.user) {
            console.log("Attempting to save for user:", session.user.id);

            const { error: dbError } = await supabase.from('student_profiles').upsert({
                user_id: session.user.id,
                full_name: parsed.basicInfo.fullName,
                email: parsed.basicInfo.email,
                ats_score: parsed.score,
                experience_years: parsed.basicInfo.experience_years,
                skills_detected: parsed.basicInfo.skills,
                missing_skills: parsed.missingSkills,
                summary: parsed.summary,
                inferred_interests: parsed.inferredInterests
            }, { onConflict: 'user_id' });

            if (dbError) {
                console.error("Supabase Write Error:", dbError);
                // Try to extract a meaningful message
                const msg = dbError.message || dbError.details || dbError.hint || JSON.stringify(dbError);
                dbStatus = { success: false, message: msg };
            } else {
                console.log("Saved analysis to Supabase!");
                dbStatus = { success: true, message: "Saved to Database" };
            }
        } else {
            console.warn("No active session found for DB save");
        }
        // --- DATABASE SAVE END ---

        // Ensure defaults...
        if (typeof parsed.score !== 'number') parsed.score = 50;
        // ... rest of validation ...

        return { ...parsed, databaseStatus: dbStatus };

    } catch (error: any) {
        console.error("Gemini Analysis Failed:", error);
        console.error("Error details:", error.message || error.toString());

        return {
            basicInfo: {
                fullName: "Error",
                email: "",
                skills: [],
                experience_years: 0,
                education: "Error",
                job_titles: []
            },
            score: 0,
            matchedSkills: [],
            missingSkills: ["Analysis Failed: " + (error.message ? error.message.slice(0, 50) : "Unknown Error")],
            recommendedSkills: [],
            details: { skillScore: 0, experienceScore: 0, roleScore: 0 },
            summary: "Failed to analyze resume. Technical details: " + (error.message || "Unknown error"),
            improvements: ["Verify API Key", "Check internet connection", "Try a different file format"]
        };
    }
};
