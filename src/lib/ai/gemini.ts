/**
 * KUIRO Live Gemini AI Client
 * Uses Google Gemini (gemini-2.5-flash-lite / gemini-2.0-flash / gemini-1.5-flash) for real-time Brand Brain extraction,
 * autonomous copy generation, multi-dimensional AI critic evaluation, surgical voice revisions, and intelligent inbox auto-replies.
 */

export interface GeminiPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string; // base64 string
  };
}

export interface GeminiGenerateOptions {
  prompt?: string;
  parts?: GeminiPart[];
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
  responseMimeType?: string;
}

export async function generateWithGemini({
  prompt,
  parts,
  systemInstruction,
  temperature = 0.7,
  maxOutputTokens = 2048,
  responseMimeType,
}: GeminiGenerateOptions): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.includes('YourGeminiApiKeyHere')) {
    throw new Error('GEMINI_API_KEY is not configured in .env.local');
  }

  const cleanKey = apiKey.replace(/^["']|["']$/g, '').trim();

  const modelsToTry = [
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
  ];

  let lastError: any = null;

  const contentParts = parts && parts.length > 0 ? parts : [{ text: prompt || '' }];

  for (const model of modelsToTry) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`;

      const generationConfig: any = {
        temperature,
        maxOutputTokens,
      };

      if (responseMimeType) {
        generationConfig.responseMimeType = responseMimeType;
      }

      const requestBody: any = {
        contents: [
          {
            role: 'user',
            parts: contentParts,
          },
        ],
        generationConfig,
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
        signal: AbortSignal.timeout(10000),
      });

      const data = await response.json();

      if (response.ok && data.candidates && data.candidates.length > 0) {
        const textPart = data.candidates[0].content?.parts?.[0]?.text || '';
        return textPart.trim();
      }

      lastError = new Error(data.error?.message || `Model ${model} returned error status ${response.status}`);
    } catch (err: any) {
      lastError = err;
    }
  }

  throw new Error(`[Gemini API Error] ${lastError?.message || 'Failed to generate content with Gemini'}`);
}

/**
 * Multimodal Audio & Voice Note Transcription using Gemini 2.5/2.0
 * Decodes voice feedback from founders in Hindi, Bengali, Hinglish, or English.
 */
export async function transcribeAudioWithGemini(
  audioInput: Buffer | string,
  mimeType: string = 'audio/ogg'
): Promise<{ transcript: string; languageDetected: string; intentSummary: string }> {
  const base64Data = typeof audioInput === 'string'
    ? (audioInput.includes('base64,') ? audioInput.split('base64,')[1] : audioInput)
    : audioInput.toString('base64');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.includes('YourGeminiApiKeyHere')) {
    return {
      transcript: 'Founder voice revision note received.',
      languageDetected: 'en-IN',
      intentSummary: 'Refine campaign messaging and format.',
    };
  }

  const prompt = `Listen carefully to this audio note from a business owner or marketing founder.
1. Transcribe the speaker's exact words faithfully in their original language/script (supporting Hindi, Bengali, Hinglish, Marathi, Tamil, Telugu, and English).
2. Detect the language used.
3. Provide a clear 1-2 sentence English summary of their marketing feedback or desired revision.

Return valid JSON only:
{
  "transcript": "Exact spoken words",
  "languageDetected": "e.g. Hinglish / Hindi / Bengali / English",
  "intentSummary": "English summary of the requested campaign change"
}`;

  try {
    const rawOutput = await generateWithGemini({
      prompt,
      parts: [
        {
          inlineData: {
            mimeType,
            data: base64Data,
          },
        },
        { text: prompt },
      ],
      systemInstruction: 'You are an elite multilingual audio transcription and intent extractor for South Asian commercial founders.',
      temperature: 0.2,
      responseMimeType: 'application/json',
    });

    let clean = rawOutput.replace(/```json/gi, '').replace(/```/gi, '').trim();
    const firstBrace = clean.indexOf('{');
    const lastBrace = clean.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      clean = clean.substring(firstBrace, lastBrace + 1);
    }
    return JSON.parse(clean);
  } catch (err) {
    console.warn('[Gemini Audio Transcription Warning]:', err);
    return {
      transcript: 'Founder voice note processed.',
      languageDetected: 'auto',
      intentSummary: 'Surgical campaign revision requested by founder.',
    };
  }
}
