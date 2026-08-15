"use client";

import { useState } from "react";

export default function CVUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "" }>({ text: "", type: "" });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setMessage({ text: "", type: "" });
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage({ text: "Pilih file PDF terlebih dahulu.", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "Sedang memproses OCR, mohon tunggu...", type: "" });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload-cv", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Terjadi kesalahan saat upload.");
      }

      setMessage({ text: "✅ CV Berhasil diproses dan skill telah disimpan!", type: "success" });
      setFile(null); // Reset file setelah sukses

      // Opsional: Trigger refresh data di parent component jika diperlukan

    } catch (error: any) {
      setMessage({ text: `❌ Gagal: ${error.message}`, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 mt-4 p-4 border border-outline-variant rounded-xl bg-surface/50">
      <h3 className="text-sm font-semibold text-on-surface">Upload CV (PDF)</h3>
      
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        disabled={loading}
        className="block w-full text-sm text-on-surface-variant 
          file:mr-4 file:py-2 file:px-4 
          file:rounded-full file:border-0 
          file:text-sm file:font-semibold 
          file:bg-primary file:text-on-primary 
          hover:file:bg-primary/90 disabled:opacity-50"
      />

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="px-4 py-2 bg-primary text-on-primary rounded-full text-sm font-medium transition-colors hover:bg-primary/90 disabled:bg-surface-variant disabled:text-on-surface-variant disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
            Memproses OCR...
          </span>
        ) : (
          "Proses CV"
        )}
      </button>

      {message.text && (
        <p className={`text-xs mt-2 ${message.type === "error" ? "text-error" : "text-primary"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}