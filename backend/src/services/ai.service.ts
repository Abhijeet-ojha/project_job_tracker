import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

console.log('Gemini key exists:', !!process.env.GEMINI_API_KEY);

// ─── Zod Schemas ────────────────────────────────────────────────────────────

const ParsedJobSchema = z.object({
  company: z.string().default(''),
  role: z.string().default(''),
  location: z.string().default(''),
  seniority: z.string().default(''),
  requiredSkills: z.array(z.string()).default([]),
  niceToHaveSkills: z.array(z.string()).default([]),
});

const ResumeSuggestionsSchema = z.object({
  suggestions: z.array(z.string()).min(1).max(5),
});

export type ParsedJob = z.infer<typeof ParsedJobSchema>;
export type ResumeSuggestions = z.infer<typeof ResumeSuggestionsSchema>;

// ─── Helper: extract JSON from raw AI output ────────────────────────────────

function extractJSON(text: string): unknown {
  // Strip markdown code fences if present
  const clean = text.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
  return JSON.parse(clean);
}

// ─── Service Functions ───────────────────────────────────────────────────────

/**
 * Parses a raw job description and returns structured fields.
 */
export async function parseJobDescription(jobDescriptionText: string): Promise<ParsedJob> {
  const prompt = `
You are a precise job description parser. Analyze the following job description and extract structured information.

Return ONLY a raw JSON object (no markdown, no code fences) with exactly these fields:
{
  "company": "Company name or empty string if not found",
  "role": "Job title/role",
  "location": "Location or remote/hybrid info, or empty string",
  "seniority": "e.g., Junior, Mid-level, Senior, Lead, Principal, or empty string",
  "requiredSkills": ["array", "of", "required", "technical", "skills"],
  "niceToHaveSkills": ["array", "of", "optional", "or", "preferred", "skills"]
}

Job Description:
---
${jobDescriptionText}
---
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  console.log('Gemini raw parse response:', text.slice(0, 200));

  const raw = extractJSON(text);
  const parsed = ParsedJobSchema.safeParse(raw);

  if (!parsed.success) {
    console.error('AI parse validation error:', parsed.error.flatten());
    throw new Error('AI returned an invalid job description structure');
  }

  return parsed.data;
}

/**
 * Generates 3-5 tailored resume bullet suggestions for a role.
 */
export async function generateResumeSuggestions(
  role: string,
  requiredSkills: string[],
  niceToHaveSkills: string[]
): Promise<string[]> {
  const skillsContext =
    requiredSkills.length > 0
      ? `Required skills: ${requiredSkills.join(', ')}.`
      : '';
  const niceContext =
    niceToHaveSkills.length > 0
      ? `Nice-to-have skills: ${niceToHaveSkills.join(', ')}.`
      : '';

  const prompt = `
You are an expert resume writer and career coach. Generate 3 to 5 strong, concise resume bullet points for a candidate applying for the following role.

Role: ${role}
${skillsContext}
${niceContext}

Rules:
- Each bullet should start with a powerful action verb (e.g., Built, Led, Optimized, Designed).
- Quantify achievements where possible (e.g., "reduced latency by 30%").
- Keep each bullet under 20 words.
- Tailor bullets to highlight the required and nice-to-have skills.

Return ONLY a raw JSON object (no markdown, no code fences) with this exact structure:
{
  "suggestions": [
    "Bullet 1",
    "Bullet 2",
    "Bullet 3"
  ]
}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const raw = extractJSON(text);
  const parsed = ResumeSuggestionsSchema.safeParse(raw);

  if (!parsed.success) {
    console.error('AI suggestions validation error:', parsed.error.flatten());
    throw new Error('AI returned invalid resume suggestions');
  }

  return parsed.data.suggestions;
}
