import type { RouteLogger } from './logger';

const PRIMARY_MODEL = 'gemini-2.5-flash';
const FALLBACK_MODEL = 'gemini-2.0-flash-lite';

export interface GeminiCallOptions {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
  model?: string;
  log?: RouteLogger;
}

export async function callGeminiWithFallback(opts: GeminiCallOptions): Promise<string | null> {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    opts.log?.error('gemini_key_missing');
    return null;
  }

  const models = [opts.model || PRIMARY_MODEL, FALLBACK_MODEL];

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    const label = i === 0 ? 'primary' : 'fallback';
    opts.log?.stage(`gemini_${label}_start`, { model });

    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const response = await ai.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: opts.prompt }] }],
        config: {
          ...(opts.systemInstruction && { systemInstruction: opts.systemInstruction }),
          temperature: opts.temperature ?? 0.2,
          maxOutputTokens: opts.maxOutputTokens ?? 8000,
        },
      });
      const result = response.text?.trim() ?? '';
      if (result) {
        opts.log?.stage(`gemini_${label}_done`, { model, bytes: result.length });
        return result;
      }
      opts.log?.warn(`gemini_${label}_empty`, { model });
    } catch (err) {
      if (i === 0) {
        opts.log?.warn(`gemini_${label}_failed`, {
          model,
          errMessage: err instanceof Error ? err.message : String(err).slice(0, 200),
        });
      } else {
        opts.log?.error(`gemini_${label}_failed`, err, { model });
      }
    }
  }

  return null;
}
