// ============================================================
// ContractClear AI — Core Domain Types
// ============================================================

/** Severity level for a risk issue extracted from a contract. */
export type RiskLevel = "critical" | "high" | "medium" | "low" | "info";

/** Processing status for a document analysis job. */
export type JobStatus =
  | "pending"
  | "uploading"
  | "queued"
  | "processing"
  | "completed"
  | "failed";

/** A single risk issue extracted by the LLM with strict evidence grounding. */
export interface Issue {
  id: string;
  jobId: string;
  riskLevel: RiskLevel;
  /** The exact verbatim quote from the contract. */
  quote: string;
  /** The page number where the quote was found. */
  pageNumber: number;
  /** Plain-English explanation of the risk. */
  explanation: string;
  /** Recommended action or negotiation strategy. */
  recommendedAction: string;
  /** LLM confidence score (0-1). */
  confidence: number;
  createdAt: string;
}

/** A contract document uploaded by the user. */
export interface Document {
  id: string;
  ownerId: string;
  fileName: string;
  fileUrl: string;
  pageCount: number | null;
  status: JobStatus;
  createdAt: string;
}

/** A processing job for a document. */
export interface Job {
  id: string;
  documentId: string;
  status: JobStatus;
  issueCount: number;
  startedAt: string | null;
  finishedAt: string | null;
  errorCode: string | null;
  errorMessage: string | null;
}

/** The structured output schema the LLM must adhere to for each issue. */
export interface LLMIssueOutput {
  risk_level: "critical" | "high" | "medium" | "low" | "info";
  quote: string;
  page_number: number;
  explanation: string;
  recommended_action: string;
  confidence: number;
}

/** LLM extraction result for a full document. */
export interface LLMExtractionResult {
  issues: LLMIssueOutput[];
  summary: string;
  totalPages: number;
}
