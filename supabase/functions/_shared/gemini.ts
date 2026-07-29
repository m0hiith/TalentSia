// Thin REST wrapper around Gemini's generateContent endpoint.
// Avoids the npm:@google/generative-ai SDK so failures (rate limits, bad
// keys, model errors) surface with Google's actual message instead of
// getting flattened into a generic Deno/npm-interop exception.
export class GeminiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

interface GenerationConfig {
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
  responseMimeType?: string;
}

const MODEL = "gemini-flash-latest";

export async function generateGeminiContent(
  apiKey: string,
  prompt: string,
  generationConfig: GenerationConfig,
): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig,
      }),
    },
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    if (res.status === 429) {
      throw new GeminiError("Gemini API rate limit reached. Please wait a minute and try again.", 429);
    }
    throw new GeminiError(`Gemini API error (${res.status}): ${body.slice(0, 300)}`, 502);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string" || !text.trim()) {
    throw new GeminiError("Gemini returned no usable content.", 502);
  }
  return text;
}
