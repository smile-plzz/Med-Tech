"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function DepartmentForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setLoading(false);
    if (res.ok) {
      setName("");
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <input
        placeholder="New department name"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="rounded border px-2 py-1 text-sm"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded border px-3 py-1 text-sm disabled:opacity-50"
      >
        Add
      </button>
    </form>
  );
}
