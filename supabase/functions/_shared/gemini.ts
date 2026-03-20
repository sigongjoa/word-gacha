// Gemini API 다중 키 fallback 호출
// GEMINI_API_KEY_1, GEMINI_API_KEY_2, GEMINI_API_KEY_3 순서로 시도
// 429(할당량 초과)면 다음 키로 자동 전환

export interface GeminiResult {
  text: string
  status: number  // 200 = 성공, 429 = 전체 소진, 기타 = 오류
}

function getApiKeys(): string[] {
  const keys: string[] = []
  for (let i = 1; i <= 3; i++) {
    const k = Deno.env.get(`GEMINI_API_KEY_${i}`) ?? ''
    if (k) keys.push(k)
  }
  // 단일 키 하위 호환
  const legacy = Deno.env.get('GEMINI_API_KEY') ?? ''
  if (legacy && !keys.includes(legacy)) keys.push(legacy)
  return keys
}

async function callOne(prompt: string, apiKey: string, maxTokens = 2048, temperature = 0.7): Promise<GeminiResult> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature, maxOutputTokens: maxTokens },
        }),
      },
    )
    if (!res.ok) return { text: '', status: res.status }
    const data = await res.json()
    const parts: { text?: string; thought?: boolean }[] =
      data.candidates?.[0]?.content?.parts ?? []
    const textPart = parts.find((p) => !p.thought) ?? parts[parts.length - 1]
    return { text: textPart?.text ?? '', status: 200 }
  } catch {
    return { text: '', status: 500 }
  }
}

export async function callGemini(
  prompt: string,
  opts: { maxTokens?: number; temperature?: number } = {},
): Promise<GeminiResult> {
  const keys = getApiKeys()
  if (!keys.length) return { text: '', status: 500 }

  for (const key of keys) {
    const result = await callOne(prompt, key, opts.maxTokens ?? 2048, opts.temperature ?? 0.7)
    if (result.status !== 429) return result  // 성공 or 429 아닌 에러 → 즉시 반환
    // 429면 다음 키로
  }

  return { text: '', status: 429 }  // 모든 키 소진
}
