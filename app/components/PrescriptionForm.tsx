"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

type ExistingPrescription = {
  medication: string;
  notes: string | null;
  ocrSourceText: string | null;
} | null;

export default function PrescriptionForm({
  appointmentId,
  existing,
}: {
  appointmentId: string;
  existing: ExistingPrescription;
}) {
  const router = useRouter();
  const [medication, setMedication] = useState(existing?.medication ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [ocrSourceText, setOcrSourceText] = useState(existing?.ocrSourceText ?? "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/prescriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId, medication, notes, ocrSourceText }),
    });
    setLoading(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-3 flex flex-col gap-2 border-t pt-3">
      <p className="text-sm font-medium">Prescription</p>
      <textarea
        placeholder="Medication"
        required
        value={medication}
        onChange={(e) => setMedication(e.target.value)}
        className="rounded border px-2 py-1 text-sm"
        rows={2}
      />
      <textarea
        placeholder="Notes (optional)"
        value={notes ?? ""}
        onChange={(e) => setNotes(e.target.value)}
        className="rounded border px-2 py-1 text-sm"
        rows={2}
      />
      <details className="text-sm">
        <summary className="cursor-pointer text-black/60 dark:text-white/60">
          OCR source text (from /ocr, optional)
        </summary>
        <textarea
          placeholder="Paste OCR output here, or use the OCR page to extract from an image"
          value={ocrSourceText ?? ""}
          onChange={(e) => setOcrSourceText(e.target.value)}
          className="mt-1 w-full rounded border px-2 py-1 text-sm"
          rows={3}
        />
      </details>
      <button
        type="submit"
        disabled={loading}
        className="w-fit rounded bg-foreground px-3 py-1.5 text-sm text-background disabled:opacity-50"
      >
        {loading ? "Saving..." : existing ? "Update prescription" : "Save prescription"}
      </button>
      {saved && <p className="text-xs text-green-700">Saved.</p>}
    </form>
  );
}
