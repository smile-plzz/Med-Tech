"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function BookingForm({ doctorId }: { doctorId: string }) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doctorId, date, timeSlot }),
    });
    if (!res.ok) {
      setStatus("error");
      return;
    }
    setStatus("done");
    router.refresh();
  }

  if (status === "done") {
    return <p className="mt-2 text-sm text-green-700">Booked. See it in your dashboard.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="mt-3 flex flex-col gap-2">
      <input
        type="date"
        required
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="rounded border px-2 py-1 text-sm"
      />
      <input
        type="time"
        required
        value={timeSlot}
        onChange={(e) => setTimeSlot(e.target.value)}
        className="rounded border px-2 py-1 text-sm"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded bg-foreground px-3 py-1.5 text-sm text-background disabled:opacity-50"
      >
        {status === "loading" ? "Booking..." : "Book appointment"}
      </button>
      {status === "error" && <p className="text-xs text-red-600">Booking failed. Try again.</p>}
    </form>
  );
}
