import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import mammoth from "mammoth";
import { ResumeData } from "@/store/resumeStore";
import { supabase } from "@/lib/supabase";
import { atsResultSchema, type ATSResult } from "@/lib/ats-schema";
import { logger } from "@/lib/logger";

export type { ATSResult } from "@/lib/ats-schema";

// Serve the PDF.js worker from our own origin (no third-party CDN at runtime). (P12)
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const extractTextFromPdf = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      fullText += textContent.items
        .map((item: unknown) => (item as { str?: string }).str || "")
        .join(" ") + "\n";
    }
    return fullText;
  } catch (error) {
    logger.error("Error extracting PDF text:", error);
    throw new Error("We couldn't read text from this PDF. It may be a scanned image.");
  }
};

const extractTextFromDocx = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    logger.error("Error extracting DOCX text:", error);
    throw new Error("We couldn't read text from this Word document.");
  }
};

/**
 * Analyze a résumé. Text extraction stays in the browser; the LLM call +
 * validation + persistence happen in the `analyze-resume` Supabase Edge Function
 * (which holds the Gemini key). On any failure this REJECTS — it never returns a
 * fabricated success-shaped result, so errors can't be persisted as profile
 * data. (P2/P3/P4/P5/P7/P8)
 */
export const analyzeResume = async (resume: ResumeData, file?: File): Promise<ATSResult> => {
  let resumeText = "";

  if (file) {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "pdf") {
      resumeText = await extractTextFromPdf(file);
    } else if (ext === "docx") {
      resumeText = await extractTextFromDocx(file);
    } else if (ext === "txt") {
      resumeText = await file.text();
    } else {
      throw new Error("Unsupported file type. Please upload a PDF, DOCX, or TXT file.");
    }

    // A file was provided but produced almost no text — likely a scanned/image
    // PDF. Be honest instead of analyzing an empty stub. (P7)
    if (resumeText.trim().length < 200) {
      throw new Error(
        "We couldn't read enough text from this file. If it's a scanned or image-based PDF, try a text-based PDF, DOCX, or TXT.",
      );
    }
  } else {
    // No file (manual re-analysis): build text from the structured profile.
    resumeText = [
      `Skills: ${resume.skills.join(", ")}`,
      `Experience Years: ${resume.experience_years}`,
      `Job Titles: ${resume.job_titles?.join(", ") ?? ""}`,
      `Interests: ${resume.interests?.join(", ") ?? ""}`,
    ].join("\n");
  }

  const targetRole = resume.interests?.join(", ") || "General Software Engineering";

  const { data, error } = await supabase.functions.invoke("analyze-resume", {
    body: { resumeText, targetRole },
  });

  if (error) {
    throw new Error(await readFunctionError(error, "We couldn't analyze your resume. Please try again."));
  }

  // Defense-in-depth: the function already validated, but re-check the shape
  // before it flows into the store. A bad shape throws instead of corrupting state.
  const validated = atsResultSchema.parse(data);
  const fullText = typeof (data as { fullText?: unknown })?.fullText === "string"
    ? (data as { fullText: string }).fullText
    : resumeText;
  return { ...validated, fullText };
};

/** Pull a friendly message out of a Supabase FunctionsHttpError response body. */
export async function readFunctionError(error: unknown, fallback: string): Promise<string> {
  const context = (error as { context?: { json?: () => Promise<unknown> } }).context;
  if (context?.json) {
    try {
      const body = await context.json();
      if (body && typeof body === "object" && "error" in body && typeof (body as { error: unknown }).error === "string") {
        return (body as { error: string }).error;
      }
    } catch {
      // fall through to the generic message
    }
  }
  return error instanceof Error && error.message ? error.message : fallback;
}
