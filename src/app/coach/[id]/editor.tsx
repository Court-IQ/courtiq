"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Submission = {
  id: string;
  user_id: string;
  status: string;
  report_card_urls: string[];
  report_pdf_url: string | null;
};

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In progress" },
  { value: "ready", label: "Ready" },
  { value: "cancelled", label: "Cancelled" },
];

export default function SubmissionEditor({
  submission,
}: {
  submission: Submission;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(submission.status);
  const [cardUrls, setCardUrls] = useState<string[]>(
    submission.report_card_urls
  );
  const [pdfUrl, setPdfUrl] = useState<string | null>(submission.report_pdf_url);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<"card" | "pdf" | null>(null);

  const handleUpload = async (files: FileList | null, kind: "card" | "pdf") => {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(kind);
    try {
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append("submission_id", submission.id);
        form.append("user_id", submission.user_id);
        form.append("kind", kind);
        form.append("file", file);
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: form,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        newUrls.push(data.signed_url);
      }
      if (kind === "card") {
        setCardUrls((prev) => [...prev, ...newUrls]);
      } else {
        setPdfUrl(newUrls[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(null);
    }
  };

  const removeCard = (idx: number) => {
    setCardUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const save = async () => {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/submissions/${submission.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          report_card_urls: cardUrls,
          report_pdf_url: pdfUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-5 space-y-5">
      <p className="text-orange-400 font-bold tracking-widest text-xs">
        ANALYSIS
      </p>

      <div>
        <label className="block text-sm font-bold text-slate-300 mb-2">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-300 mb-2">
          Card images ({cardUrls.length})
        </label>
        {cardUrls.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-2">
            {cardUrls.map((url, idx) => (
              <div key={idx} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`card ${idx + 1}`}
                  className="w-full aspect-[9/16] object-cover rounded-lg border border-slate-700"
                />
                <button
                  type="button"
                  onClick={() => removeCard(idx)}
                  className="absolute -top-1 -right-1 bg-red-600 text-white w-5 h-5 rounded-full text-xs"
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <label className="block">
          <span className="block w-full text-center py-2 rounded-lg border border-dashed border-slate-600 text-sm text-slate-300 cursor-pointer hover:border-orange-500">
            {uploading === "card" ? "Uploading..." : "+ Upload card PNG(s)"}
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={uploading !== null}
            onChange={(e) => handleUpload(e.target.files, "card")}
            className="hidden"
          />
        </label>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-300 mb-2">
          PDF report
        </label>
        {pdfUrl ? (
          <div className="flex items-center justify-between bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener"
              className="text-orange-400 underline truncate"
            >
              View uploaded PDF
            </a>
            <button
              type="button"
              onClick={() => setPdfUrl(null)}
              className="text-red-400 ml-2"
            >
              ×
            </button>
          </div>
        ) : (
          <label className="block">
            <span className="block w-full text-center py-2 rounded-lg border border-dashed border-slate-600 text-sm text-slate-300 cursor-pointer hover:border-orange-500">
              {uploading === "pdf" ? "Uploading..." : "+ Upload PDF"}
            </span>
            <input
              type="file"
              accept="application/pdf"
              disabled={uploading !== null}
              onChange={(e) => handleUpload(e.target.files, "pdf")}
              className="hidden"
            />
          </label>
        )}
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-200 rounded-lg px-3 py-2 text-sm">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="w-full py-3 rounded-xl font-bold text-slate-900 bg-gradient-to-r from-orange-500 to-orange-400 hover:opacity-90 disabled:opacity-50 transition"
      >
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}
