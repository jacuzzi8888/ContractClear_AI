// ============================================================
// ContractClear AI — Application Constants
// ============================================================

export const APP_NAME = "ContractClear AI";
export const APP_DESCRIPTION =
  "AI-powered contract risk analysis with strict evidence grounding.";

// ── File Upload ────────────────────────────────────────────
/** Maximum file size for uploads (in bytes). Default: 50MB */
export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;
export const MAX_FILE_SIZE_DISPLAY = "50 MB";

/** Accepted file types for upload. */
export const ACCEPTED_FILE_TYPES = ["application/pdf"];

/** Supabase storage bucket name for contract PDFs. */
export const STORAGE_BUCKET = "contracts";

// ── Gemini ─────────────────────────────────────────────────
/** The Gemini model used for extraction. */
export const GEMINI_MODEL = "gemini-3-flash-preview";

/** Display-friendly name for the AI model (shown on landing page, FAQ, etc.). */
export const GEMINI_MODEL_DISPLAY = "Gemini 3 Flash";

/** Minimum confidence threshold — issues below this are dropped. */
export const MIN_CONFIDENCE_THRESHOLD = 0.6;

// ── Inngest ────────────────────────────────────────────────
export const INNGEST_APP_ID = "contract-clear-ai";
export const INNGEST_EVENT_NAME = "contract/analyze";
export const INNGEST_FUNCTION_ID = "analyze-contract";
export const INNGEST_FAILURE_FUNCTION_ID = "handle-analysis-failure";
export const INNGEST_MAX_DURATION = 300;
export const INNGEST_RETRIES = 2;

// ── UI ─────────────────────────────────────────────────────
export const RECENT_DOCS_LIMIT = 5;
export const HISTORY_ITEMS_PER_PAGE = 10;
export const POLLING_INTERVAL_MS = 4000;
export const SUCCESS_BANNER_DURATION_MS = 8000;
export const TOAST_DURATION_MS = 3000;

// ── Risk level display configuration ───────────────────────
export const RISK_LEVEL_CONFIG = {
  critical: {
    label: "Critical",
    color: "#dc2626",
    bgColor: "#fef2f2",
    borderColor: "#fecaca",
    icon: "AlertTriangle",
  },
  high: {
    label: "High",
    color: "#ea580c",
    bgColor: "#fff7ed",
    borderColor: "#fed7aa",
    icon: "AlertCircle",
  },
  medium: {
    label: "Medium",
    color: "#d97706",
    bgColor: "#fffbeb",
    borderColor: "#fde68a",
    icon: "Info",
  },
  low: {
    label: "Low",
    color: "#16a34a",
    bgColor: "#f0fdf4",
    borderColor: "#bbf7d0",
    icon: "CheckCircle",
  },
  info: {
    label: "Info",
    color: "#0d9488",
    bgColor: "#f0fdfa",
    borderColor: "#99f6e4",
    icon: "Info",
  },
} as const;
