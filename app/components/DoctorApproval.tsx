"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DoctorApproval({
  doctorId,
  approved,
}: {
  doctorId: string;
  approved: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await fetch(`/api/doctors/${doctorId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: !approved }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`rounded px-3 py-1 text-sm ${
        approved ? "border" : "bg-foreground text-background"
      } disabled:opacity-50`}
    >
      {approved ? "Revoke" : "Approve"}
    </button>
  );
}
