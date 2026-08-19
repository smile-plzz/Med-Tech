"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const NEXT_STATUS: Record<string, { label: string; status: string }[]> = {
  PENDING: [
    { label: "Approve", status: "APPROVED" },
    { label: "Reject", status: "REJECTED" },
  ],
  APPROVED: [
    { label: "Mark complete", status: "COMPLETED" },
    { label: "Cancel", status: "CANCELLED" },
  ],
};

export default function AppointmentActions({
  appointmentId,
  status,
}: {
  appointmentId: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const options = NEXT_STATUS[status] ?? [];

  async function setStatus(next: string) {
    setLoading(true);
    await fetch(`/api/appointments/${appointmentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setLoading(false);
    router.refresh();
  }

  if (options.length === 0) return null;

  return (
    <div className="mt-2 flex gap-2">
      {options.map((o) => (
        <button
          key={o.status}
          disabled={loading}
          onClick={() => setStatus(o.status)}
          className="rounded border px-3 py-1 text-sm disabled:opacity-50"
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
