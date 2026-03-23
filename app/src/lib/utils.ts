// ============================================================
// ContractClear AI — Utility Functions
// ============================================================

import { MAX_FILE_SIZE_BYTES, ACCEPTED_FILE_TYPES } from "./constants";

/** Format bytes into a human-readable string. */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

/** Validate an uploaded file against size and type constraints. */
export function validateFile(file: File): { valid: boolean; error?: string } {
  if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
    return { valid: false, error: "Only PDF files are accepted." };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File exceeds the maximum size of ${formatFileSize(MAX_FILE_SIZE_BYTES)}.`,
    };
  }
  return { valid: true };
}

/** Generate a short, human-readable relative time string. */
export function timeAgo(dateString: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Classname merge helper. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
