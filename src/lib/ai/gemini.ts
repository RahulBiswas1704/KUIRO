/**
 * KUIRO Live Gemini AI Client
 * Uses Google Gemini 3.5 Flash Lite for real-time Brand Brain extraction,
 * autonomous copy generation, and intelligent inbox auto-replies.
 */

export interface GeminiGenerateOptions {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
}

export async function generateWithGemini({
  prompt,
  systemInstruction,
  temperature = 0.7,
}: GeminiGenerateOptions): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.includes('YourGeminiApiKeyHere')) {
    throw new Error('GEMINI_API_KEY is not configured in .env.local');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;

  const requestBody: any = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature,
      maxOutputTokens: 1024,
    },
  };

  if (systemInstruction) {
    requestBody.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  const data = await response.json();

  if (!response.ok || !data.candidates || data.candidates.length === 0) {
    const errorMsg = data.error?.message || 'Failed to generate content with Gemini';
    throw new Error(`[Gemini API Error] ${errorMsg}`);
  }

  return data.candidates[0].content.parts[0].text.trim();
}

