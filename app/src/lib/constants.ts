// ============================================================
// ContractClear AI — Application Constants
// ============================================================

export const APP_NAME = "ContractClear AI";
export const APP_DESCRIPTION =
  "AI-powered contract risk analysis with strict evidence grounding.";

/** Maximum file size for uploads (in bytes). Default: 50MB */
export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

/** Accepted file types for upload. */
export const ACCEPTED_FILE_TYPES = ["application/pdf"];

/** The Gemini model used for extraction. */
export const GEMINI_MODEL = "gemini-3-flash-preview";

/** Minimum confidence threshold — issues below this are dropped. */
export const MIN_CONFIDENCE_THRESHOLD = 0.6;

/** Risk level display configuration. */
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
