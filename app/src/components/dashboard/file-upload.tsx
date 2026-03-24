"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileText,
  X,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  FileSearch,
  HardDrive,
  File,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MAX_FILE_SIZE_DISPLAY } from "@/lib/constants";

interface FileUploadProps {
  onJobStart: (jobId: string) => void;
  isExternalProcessing?: boolean;
}

export function FileUpload({ onJobStart, isExternalProcessing }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setErrorMessage(null);
      setStatus("idle");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    multiple: false,
    disabled: status !== "idle" && status !== "error",
  });

  const uploadFile = async () => {
    if (!file) return;
    setStatus("uploading");
    setProgress(10);

    try {
      const signRes = await fetch("/api/uploads/sign", {
        method: "POST",
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          fileSize: file.size,
        }),
      });

      if (!signRes.ok) throw new Error("Failed to get upload authorization");
      const { uploadUrl, documentId } = await signRes.json();
      setProgress(30);

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadRes.ok) throw new Error("Cloud upload failed");
      setProgress(70);

      const jobRes = await fetch("/api/jobs", {
        method: "POST",
        body: JSON.stringify({ documentId }),
      });

      if (!jobRes.ok) {
        const errorData = await jobRes.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || "Analysis trigger failed");
      }

      setStatus("success");
      setProgress(100);
      onJobStart(documentId);

    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMessage(err.message || "An unexpected error occurred");
    }
  };

  const reset = () => {
    setFile(null);
    setStatus("idle");
    setProgress(0);
    setErrorMessage(null);
  };

  return (
    <div className="w-full">
      <div className="card-upload rounded-2xl overflow-hidden">
        {!file ? (
          /* ── Split: Dropzone (full width when no file) ── */
          <div
            {...getRootProps()}
            className={cn(
              "flex flex-col md:flex-row min-h-[200px] cursor-pointer transition-all duration-300",
              isDragActive ? "bg-[var(--color-brand-50)]" : ""
            )}
          >
            <input {...getInputProps()} />

            {/* Left: Upload zone */}
            <div className="flex-1 p-8 md:p-10 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-[var(--color-surface-200)]">
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300",
                isDragActive
                  ? "bg-[var(--color-brand-600)] scale-110"
                  : "bg-[var(--color-brand-50)] border border-[var(--color-brand-200)]"
              )}>
                <Upload className={cn(
                  "transition-colors",
                  isDragActive ? "text-white" : "text-[var(--color-brand-600)]"
                )} size={28} />
              </div>
              <h3 className="text-lg font-bold text-[var(--color-surface-900)] mb-1">
                {isDragActive ? "Drop your contract here" : "Drag & drop your contract"}
              </h3>
              <p className="text-sm text-[var(--color-surface-500)]">
                or click to browse files
              </p>
            </div>

            {/* Right: Info */}
            <div className="flex-1 p-8 md:p-10 flex flex-col justify-center">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-100)] border border-[var(--color-surface-200)] flex items-center justify-center">
                    <FileSearch size={18} className="text-[var(--color-brand-600)]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-surface-900)]">PDF Contracts</p>
                    <p className="text-xs text-[var(--color-surface-500)]">NDAs, leases, SaaS agreements, employment contracts</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-100)] border border-[var(--color-surface-200)] flex items-center justify-center">
                    <HardDrive size={18} className="text-[var(--color-brand-600)]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-surface-900)]">Up to {MAX_FILE_SIZE_DISPLAY}</p>
                    <p className="text-xs text-[var(--color-surface-500)]">Supports scanned and text-based PDFs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ── Split: File Preview + Actions ── */
          <div className="flex flex-col md:flex-row min-h-[200px]">
            {/* Left: File info */}
            <div className="flex-1 p-8 md:p-10 flex items-center gap-5 border-b md:border-b-0 md:border-r border-[var(--color-surface-200)]">
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-100)] border border-[var(--color-surface-200)] flex items-center justify-center flex-shrink-0">
                <FileText className="text-[var(--color-brand-600)]" size={28} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-base text-[var(--color-surface-900)] truncate">
                  {file.name}
                </h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-[var(--color-surface-500)] flex items-center gap-1">
                    <File size={12} /> {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                  <span className="text-xs text-[var(--color-surface-400)]">·</span>
                  <span className="text-xs text-[var(--color-surface-500)]">PDF Document</span>
                </div>
              </div>
              {(status === "idle" || status === "error") && (
                <button
                  onClick={reset}
                  className="p-2 hover:bg-[var(--color-surface-200)] rounded-lg text-[var(--color-surface-400)] hover:text-[var(--color-surface-900)] transition-colors flex-shrink-0"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Right: Action / Status */}
            <div className="flex-1 p-8 md:p-10 flex items-center justify-center">
              {status === "idle" && (
                <button
                  onClick={uploadFile}
                  className="btn-primary px-8 py-3 rounded-xl text-base font-bold w-full md:w-auto"
                >
                  <Upload size={18} />
                  Analyze Contract
                </button>
              )}

              {(status === "uploading" || status === "processing") && (
                <div className="w-full space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Loader2 className="animate-spin text-[var(--color-brand-600)]" size={16} />
                      <span className="text-xs font-bold text-[var(--color-surface-700)] uppercase tracking-wider">
                        {status === "uploading" ? "Uploading..." : "AI Processing..."}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-[var(--color-surface-500)]">{progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-[var(--color-surface-200)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--color-brand-600)] rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {status === "success" && !isExternalProcessing && (
                <div className="flex items-center gap-3 text-green-600">
                  <CheckCircle2 size={24} />
                  <div>
                    <p className="text-sm font-bold">Analysis Queued</p>
                    <p className="text-xs text-[var(--color-surface-500)]">Redirecting to live results...</p>
                  </div>
                </div>
              )}

              {status === "error" && (
                <div className="w-full bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-3 text-red-600 mb-3">
                    <AlertTriangle size={20} />
                    <p className="text-sm font-bold">{errorMessage}</p>
                  </div>
                  <button
                    onClick={uploadFile}
                    className="px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-xs font-bold text-red-700 transition-colors"
                  >
                    Retry Upload
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Progress bar at bottom */}
        {(status === "uploading" || status === "processing") && (
          <div className="h-1 w-full bg-[var(--color-surface-200)]">
            <div
              className="h-full bg-[var(--color-brand-600)] transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
