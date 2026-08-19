"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function FeedbackForm({ appointmentId }: { appointmentId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId, rating, comment }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-2 flex flex-col gap-2 border-t pt-2">
      <label className="text-sm">
        Rating:{" "}
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="rounded border px-2 py-1"
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>
      <input
        placeholder="Comment (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="rounded border px-2 py-1 text-sm"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-fit rounded bg-foreground px-3 py-1.5 text-sm text-background disabled:opacity-50"
      >
        {loading ? "Sending..." : "Send feedback"}
      </button>
    </form>
  );
}
