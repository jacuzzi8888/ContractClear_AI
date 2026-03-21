// ============================================================
// ContractClear AI — Gemini Integration Module
// ============================================================

import { GoogleGenAI } from "@google/genai";
import { GEMINI_MODEL } from "./constants";
import type { LLMExtractionResult } from "@/types";

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
  }
  return new GoogleGenAI({ apiKey });
}

// ── System Prompt ────────────────────────────────────────────
const SYSTEM_PROMPT = `You are ContractClear AI, a senior legal risk analyst.

Your task is to analyze the attached legal contract PDF and extract ALL potential risks, liabilities, unfair terms, and missing protections.

## STRICT RULES — Evidence-First Protocol

1. **Every issue MUST include an exact, verbatim quote** copied from the contract. Do NOT paraphrase.
2. **Every issue MUST include the page number** where the quote appears.
3. **Do NOT fabricate quotes.** If you cannot find a verbatim quote, do not report the issue.
4. **Assign a confidence score** (0.0 to 1.0) reflecting how certain you are the risk is real.
5. **Classify risk level** as one of: "critical", "high", "medium", "low", or "info".

## Categories to Watch For
- Auto-renewal / evergreen clauses
- Unlimited liability or uncapped indemnification
- Unilateral termination rights favoring one party
- Non-compete or exclusivity restrictions
- IP ownership transfers or broad licensing grants
- Data handling and privacy shortcomings
- Payment terms that disadvantage one party (e.g., net-90+)
- Missing confidentiality, force majeure, or dispute resolution clauses
- Governing law / jurisdiction concerns
- Penalty clauses or liquidated damages

## Output Format
Return a JSON object with exactly this structure:
{
  "issues": [
    {
      "risk_level": "critical" | "high" | "medium" | "low" | "info",
      "quote": "<exact verbatim text from the contract>",
      "page_number": <integer>,
      "explanation": "<plain-English explanation of why this is a risk>",
      "recommended_action": "<specific action the user should take>",
      "confidence": <float between 0.0 and 1.0>
    }
  ],
  "summary": "<2-3 sentence executive summary of overall contract risk>",
  "totalPages": <integer — total pages in the document>
}

IMPORTANT: Return ONLY the JSON object, no markdown fences, no commentary.`;

// ── Analyze Function ─────────────────────────────────────────
export async function analyzeContractPDF(
  pdfBase64: string
): Promise<LLMExtractionResult> {
  const client = getClient();
  const response = await client.models.generateContent({
    model: GEMINI_MODEL,
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: "application/pdf",
              data: pdfBase64,
            },
          },
          {
            text: "Analyze this contract for legal risks following the protocol.",
          },
        ],
      },
    ],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.1,
      responseMimeType: "application/json",
      // Note: We use the raw schema object for @google/genai
      responseSchema: {
        type: "OBJECT",
        properties: {
          issues: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                risk_level: {
                  type: "STRING",
                  enum: ["critical", "high", "medium", "low", "info"],
                },
                quote: { type: "STRING" },
                page_number: { type: "INTEGER" },
                explanation: { type: "STRING" },
                recommended_action: { type: "STRING" },
                confidence: { type: "NUMBER" },
              },
              required: [
                "risk_level",
                "quote",
                "page_number",
                "explanation",
                "recommended_action",
                "confidence",
              ],
            },
          },
          summary: { type: "STRING" },
          totalPages: { type: "INTEGER" },
        },
        required: ["issues", "summary", "totalPages"],
      },
    },
  });

  const text = response.text();

  // Parse the structured JSON response
  const result: LLMExtractionResult = JSON.parse(text);
  return result;
}

// ── Email Generation Function ────────────────────────────────
const EMAIL_PROMPT = `You are a tough, professional corporate lawyer negotiating a contract. 
Write an email to the counterparty drafting a request to change or remove a specific clause.

Tone: Firm, polite, professional, and clear.
Do not use placeholders like [Your Name], just write the core message that the user can copy.
Reference the verbatim quote provided and explain concisely why it is unacceptable or needs modification based on the provided explanation.`;

export async function draftNegotiationEmail(
  quote: string,
  explanation: string,
  recommendedAction: string
): Promise<{ subject: string; body: string }> {
  try {
    const client = getClient();
    const response = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Draft an email addressing this specific issue in the contract:
              
              Verbatim Quote from Contract: "${quote}"
              
              Why this is an issue: ${explanation}
              
              Recommended Resolution: ${recommendedAction}`
            }
          ]
        }
      ],
      config: {
        systemInstruction: EMAIL_PROMPT,
        temperature: 0.3,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            subject: { type: "STRING" },
            body: { type: "STRING" },
          },
          required: ["subject", "body"],
        },
      },
    });

    const text = response.text();
    const result = JSON.parse(text);
    return result;
  } catch (error) {
    console.error("Error generating email:", error);
    throw new Error("Failed to generate negotiation email.");
  }
}

