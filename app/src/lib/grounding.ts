// ============================================================
// ContractClear AI — Grounding Validation Layer
// ============================================================
// Strict server-side filter that ensures every LLM-generated
// issue is grounded in real evidence from the source document.
// Issues that fail validation are silently dropped.
// ============================================================

import { MIN_CONFIDENCE_THRESHOLD } from "./constants";
import type { LLMIssueOutput, RiskLevel } from "@/types";

const VALID_RISK_LEVELS: RiskLevel[] = [
  "critical",
  "high",
  "medium",
  "low",
  "info",
];

interface ValidationResult {
  valid: LLMIssueOutput[];
  dropped: number;
}

/**
 * Validates LLM-extracted issues against strict grounding rules.
 *
 * Drops any issue that:
 * - Has no quote or an empty/whitespace-only quote
 * - Has no page_number or page_number <= 0
 * - Has confidence below the minimum threshold
 * - Has an invalid risk_level
 */
export function validateIssues(issues: LLMIssueOutput[]): ValidationResult {
  const valid: LLMIssueOutput[] = [];
  let dropped = 0;

  for (const issue of issues) {
    // 1. Must have a non-empty verbatim quote
    if (!issue.quote || issue.quote.trim().length === 0) {
      dropped++;
      continue;
    }

    // 2. Must have a valid page number
    if (!issue.page_number || issue.page_number <= 0) {
      dropped++;
      continue;
    }

    // 3. Must meet minimum confidence threshold
    if (
      typeof issue.confidence !== "number" ||
      issue.confidence < MIN_CONFIDENCE_THRESHOLD
    ) {
      dropped++;
      continue;
    }

    // 4. Must have a valid risk level
    if (!VALID_RISK_LEVELS.includes(issue.risk_level as RiskLevel)) {
      dropped++;
      continue;
    }

    // 5. Must have an explanation
    if (!issue.explanation || issue.explanation.trim().length === 0) {
      dropped++;
      continue;
    }

    valid.push(issue);
  }

  return { valid, dropped };
}
