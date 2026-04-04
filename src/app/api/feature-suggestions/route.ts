import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { getKeywordFeatureSuggestions } from '@/lib/featureSuggestionFallback';

export const runtime = 'nodejs';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

function parseSuggestionsJson(text: string): string[] {
  const trimmed = text.trim();
  let obj: unknown;
  try {
    obj = JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        obj = JSON.parse(match[0]);
      } catch {
        return [];
      }
    } else {
      return [];
    }
  }
  if (
    obj &&
    typeof obj === 'object' &&
    'suggestions' in obj &&
    Array.isArray((obj as { suggestions: unknown }).suggestions)
  ) {
    return (obj as { suggestions: string[] }).suggestions.filter(
      (s): s is string => typeof s === 'string' && s.trim().length > 0
    );
  }
  return [];
}

export async function POST(request: Request) {
  let query = '';
  try {
    const body = await request.json();
    query = typeof body.query === 'string' ? body.query.trim() : '';
  } catch {
    return NextResponse.json(
      { suggestions: [], source: 'none' as const },
      { headers: corsHeaders }
    );
  }

  if (query.length < 2) {
    return NextResponse.json(
      { suggestions: [] as string[], source: 'none' as const },
      { headers: corsHeaders }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        suggestions: getKeywordFeatureSuggestions(query),
        source: 'keyword' as const,
      },
      { headers: corsHeaders }
    );
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL ?? 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.4,
        maxOutputTokens: 512,
      },
    });

    const prompt = `You suggest concise software product feature request titles.

The user is typing this title (may be a partial word or phrase): ${JSON.stringify(query)}

Return ONLY valid JSON (no markdown fences) in this exact shape:
{"suggestions":["title 1","title 2","title 3","title 4"]}

Rules:
- Exactly 4 strings in the array when the input is meaningful; use fewer only if input is random characters.
- Each string is a complete feature title, under 90 characters, specific and actionable.
- If the input suggests a theme, follow it (e.g. "dark" or "theme" → dark mode related; "bug" or "fix" → bug-fix style; "export" → export/download features).
- No duplicate titles. English only.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    let suggestions = parseSuggestionsJson(text).slice(0, 4);

    if (suggestions.length === 0) {
      suggestions = getKeywordFeatureSuggestions(query);
      return NextResponse.json(
        { suggestions, source: 'keyword' as const },
        { headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { suggestions, source: 'gemini' as const },
      { headers: corsHeaders }
    );
  } catch (e) {
    console.error('feature-suggestions:', e);
    return NextResponse.json(
      {
        suggestions: getKeywordFeatureSuggestions(query),
        source: 'keyword' as const,
        error: 'Gemini request failed; showing keyword suggestions.',
      },
      { status: 200, headers: corsHeaders }
    );
  }
}
