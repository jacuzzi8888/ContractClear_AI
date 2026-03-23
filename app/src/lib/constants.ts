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
    color: "#EF4444",
    bgColor: "rgba(239, 68, 68, 0.1)",
    borderColor: "rgba(239, 68, 68, 0.3)",
    icon: "AlertTriangle",
  },
  high: {
    label: "High",
    color: "#F97316",
    bgColor: "rgba(249, 115, 22, 0.1)",
    borderColor: "rgba(249, 115, 22, 0.3)",
    icon: "AlertCircle",
  },
  medium: {
    label: "Medium",
    color: "#EAB308",
    bgColor: "rgba(234, 179, 8, 0.1)",
    borderColor: "rgba(234, 179, 8, 0.3)",
    icon: "Info",
  },
  low: {
    label: "Low",
    color: "#22C55E",
    bgColor: "rgba(34, 197, 94, 0.1)",
    borderColor: "rgba(34, 197, 94, 0.3)",
    icon: "CheckCircle",
  },
  info: {
    label: "Info",
    color: "#6366F1",
    bgColor: "rgba(99, 102, 241, 0.1)",
    borderColor: "rgba(99, 102, 241, 0.3)",
    icon: "Info",
  },
} as const;
