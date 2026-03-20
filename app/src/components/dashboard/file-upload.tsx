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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onJobStart: (jobId: string) => void;
}

export function FileUpload({ onJobStart }: FileUploadProps) {
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
      // 1. Get signed URL and initialize document
      const signRes = await fetch("/api/uploads/sign", {
        method: "POST",
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
        }),
      });

      if (!signRes.ok) throw new Error("Failed to get upload authorization");
      const { uploadUrl, documentId } = await signRes.json();
      setProgress(30);

      // 2. Upload to Supabase Storage directly
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadRes.ok) throw new Error("Cloud upload failed");
      setProgress(70);

      // 3. Trigger analysis job
      const jobRes = await fetch("/api/jobs", {
        method: "POST",
        body: JSON.stringify({ documentId }),
      });

      if (!jobRes.ok) throw new Error("Analysis trigger failed");
      
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
    <div className="w-full space-y-4 font-inter">
      {!file ? (
        <div
          {...getRootProps()}
          className={cn(
            "relative group overflow-hidden glass-card rounded-3xl border-2 border-dashed transition-all duration-300 p-12 md:p-20 text-center cursor-pointer",
            isDragActive 
              ? "border-[var(--color-brand-400)] bg-[var(--color-brand-500)]/5 scale-[0.99]" 
              : "border-white/10 hover:border-white/20 hover:bg-white/5"
          )}
        >
          <input {...getInputProps()} />
          <div className="relative z-10">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
              <Upload className="text-[var(--color-brand-400)]" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 leading-tight">
              Ready to clear your contract?
            </h3>
            <p className="text-gray-400 text-sm max-w-xs mx-auto mb-8">
              Drag and drop your contract PDF here to instantly detect hidden risks and legal pitfalls.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-bold uppercase tracking-widest group-hover:bg-indigo-500/20 transition-colors">
              <FileSearch size={14} />
              Support PDFs up to 50MB
            </div>
          </div>
          
          {/* Animated background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-500/5 blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>
      ) : (
        <div className="glass-card rounded-3xl p-6 md:p-8 border border-white/10 relative overflow-hidden">
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                <FileText className="text-indigo-400" size={28} />
              </div>
              <div>
                <h4 className="font-bold text-lg text-white truncate max-w-[200px] md:max-w-md">
                  {file.name}
                </h4>
                <p className="text-sm text-gray-500 uppercase tracking-tighter">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • PDF Document
                </p>
              </div>
            </div>
            
            {(status === "idle" || status === "error") && (
              <button 
                onClick={reset}
                className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>

          <div className="mt-8 space-y-6 relative z-10">
            {status === "idle" && (
              <button
                onClick={uploadFile}
                className="w-full btn-primary py-4 rounded-2xl text-lg font-bold shadow-xl shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all active:scale-[0.98]"
              >
                Analyze Securely
              </button>
            )}

            {(status === "uploading" || status === "processing") && (
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-3">
                    <Loader2 className="animate-spin text-indigo-400" size={20} />
                    <span className="text-sm font-bold text-white uppercase tracking-widest">
                      {status === "uploading" ? "Encrypting & Uploading..." : "AI Processing Pipeline..."}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-gray-500">{progress}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {status === "success" && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex items-center gap-3 text-green-400">
                <CheckCircle2 size={24} />
                <div className="flex-1">
                  <p className="text-sm font-bold uppercase tracking-wider">Analysis Queued</p>
                  <p className="text-xs opacity-70">Redirecting to live results...</p>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-400 animate-shake">
                <AlertTriangle size={24} />
                <div className="flex-1">
                  <p className="text-sm font-bold uppercase tracking-wider">Upload Failed</p>
                  <p className="text-xs opacity-70">{errorMessage}</p>
                </div>
                <button 
                  onClick={uploadFile}
                  className="px-4 py-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-xs font-bold transition-colors"
                >
                  Retry
                </button>
              </div>
            )}
          </div>

          {/* Progress background fill */}
          <div 
            className="absolute bottom-0 left-0 h-1 bg-indigo-500/20 blur-sm transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
