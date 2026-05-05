import type { RouteLogger } from './logger';

// ── Provider configs ─────────────────────────────────────────
// Each provider is tried in order. Skipped if env key is not set.

interface ProviderDef {
  name: string;
  envKey: string;
  models: string[];
  call: (prompt: string, system: string, model: string, apiKey: string, temp: number, maxTokens: number) => Promise<string>;
}

async function callGeminiModel(prompt: string, system: string, model: string, apiKey: string, temp: number, maxTokens: number): Promise<string> {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      ...(system && { systemInstruction: system }),
      temperature: temp,
      maxOutputTokens: maxTokens,
    },
  });
  return response.text?.trim() ?? '';
}

async function callOpenAICompatible(
  endpoint: string,
  prompt: string, system: string, model: string, apiKey: string, temp: number, maxTokens: number,
): Promise<string> {
  const messages: { role: string; content: string }[] = [];
  if (system) messages.push({ role: 'system', content: system });
  messages.push({ role: 'user', content: prompt });

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, messages, temperature: temp, max_tokens: maxTokens }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`${res.status}: ${body.slice(0, 200)}`);
  }

  const json = await res.json() as { choices?: { message?: { content?: string } }[] };
  return json.choices?.[0]?.message?.content?.trim() ?? '';
}

const PROVIDERS: ProviderDef[] = [
  {
    name: 'gemini',
    envKey: 'GEMINI_API_KEY',
    models: ['gemini-2.5-flash'],
    call: callGeminiModel,
  },
  {
    name: 'groq',
    envKey: 'GROQ_API_KEY',
    models: ['llama-3.3-70b-versatile'],
    call: (p, s, m, k, t, mt) => callOpenAICompatible('https://api.groq.com/openai/v1/chat/completions', p, s, m, k, t, mt),
  },
  {
    name: 'openrouter',
    envKey: 'OPENROUTER_API_KEY',
    models: ['openai/gpt-oss-120b:free', 'minimax/minimax-m2.5:free', 'qwen/qwen3-next-80b-a3b-instruct:free'],
    call: (p, s, m, k, t, mt) => callOpenAICompatible('https://openrouter.ai/api/v1/chat/completions', p, s, m, k, t, mt),
  },
  {
    name: 'gemini-lite',
    envKey: 'GEMINI_API_KEY',
    models: ['gemini-2.0-flash-lite'],
    call: callGeminiModel,
  },
];

// ── Public API ───────────────────────────────────────────────

export interface GeminiCallOptions {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
  model?: string;
  log?: RouteLogger;
}

export async function callGeminiWithFallback(opts: GeminiCallOptions): Promise<string | null> {
  const temp = opts.temperature ?? 0.2;
  const maxTokens = opts.maxOutputTokens ?? 8000;
  const system = opts.systemInstruction ?? '';
  const totalStart = Date.now();
  let attemptCount = 0;

  opts.log?.stage('ai_call_begin', {
    promptChars: opts.prompt.length,
    systemChars: system.length,
    temperature: temp,
    maxTokens,
    preferredModel: opts.model || 'default',
  });

  for (const provider of PROVIDERS) {
    const apiKey = process.env[provider.envKey];
    if (!apiKey) continue;

    const models = provider.name === 'gemini' && opts.model
      ? [opts.model]
      : provider.models;

    for (const model of models) {
      attemptCount++;
      const callStart = Date.now();
      opts.log?.stage(`${provider.name}_start`, { model, attempt: attemptCount });

      try {
        const result = await provider.call(opts.prompt, system, model, apiKey, temp, maxTokens);
        const callMs = Date.now() - callStart;

        if (result) {
          opts.log?.stage(`${provider.name}_done`, {
            model, bytes: result.length, callMs,
            totalMs: Date.now() - totalStart,
            attempts: attemptCount,
            lines: result.split('\n').length,
            hasPMIDs: /PMID/i.test(result),
            hasNumbers: /\d+\.?\d*%/.test(result),
          });
          return result;
        }
        opts.log?.warn(`${provider.name}_empty`, { model, callMs });
      } catch (err) {
        const callMs = Date.now() - callStart;
        opts.log?.warn(`${provider.name}_failed`, {
          model, callMs, attempt: attemptCount,
          errMessage: err instanceof Error ? err.message : String(err).slice(0, 200),
        });
      }
    }
  }

  opts.log?.error('all_providers_exhausted', undefined, {
    totalMs: Date.now() - totalStart, attempts: attemptCount,
  });
  return null;
}
