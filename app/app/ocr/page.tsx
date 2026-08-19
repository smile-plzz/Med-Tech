"use client";

import { useState, ChangeEvent } from "react";

export default function OcrPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setText("");
    setProgress(0);
    setPreview(URL.createObjectURL(file));
    setRunning(true);
    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("eng", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") setProgress(Math.round(m.progress * 100));
        },
      });
      const { data } = await worker.recognize(file);
      setText(data.text);
      await worker.terminate();
    } catch {
      setError("OCR failed. Try a clearer image.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Prescription OCR</h1>
        <p className="text-sm text-black/60 dark:text-white/60">
          Upload a photo of a handwritten or printed prescription to extract text. Runs
          entirely in your browser via Tesseract.js. Copy the result into a
          prescription record from the doctor dashboard.
        </p>
      </div>
      <input type="file" accept="image/*" onChange={onFile} />
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Uploaded document preview" className="max-w-sm rounded border" />
      )}
      {running && <p className="text-sm">Recognizing text... {progress}%</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {text && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Extracted text</p>
          <textarea
            readOnly
            value={text}
            rows={8}
            className="rounded border px-3 py-2 font-mono text-sm"
          />
        </div>
      )}
    </div>
  );
}
