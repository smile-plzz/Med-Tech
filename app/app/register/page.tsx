"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";

type Department = { id: string; name: string };

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"PATIENT" | "DOCTOR">("PATIENT");
  const [departmentId, setDepartmentId] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/departments")
      .then((r) => r.json())
      .then(setDepartments)
      .catch(() => {});
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        role,
        departmentId: role === "DOCTOR" ? departmentId : undefined,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Registration failed");
      return;
    }
    const data = await res.json();
    router.push(data.role === "DOCTOR" ? "/dashboard/doctor" : "/dashboard/patient");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto flex max-w-sm flex-col gap-4">
      <h1 className="text-2xl font-bold">Create account</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <input
        placeholder="Full name"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="rounded border px-3 py-2"
      />
      <input
        type="email"
        placeholder="Email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded border px-3 py-2"
      />
      <input
        type="password"
        placeholder="Password (min 6 chars)"
        required
        minLength={6}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="rounded border px-3 py-2"
      />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as "PATIENT" | "DOCTOR")}
        className="rounded border px-3 py-2"
      >
        <option value="PATIENT">Patient</option>
        <option value="DOCTOR">Doctor</option>
      </select>
      {role === "DOCTOR" && (
        <select
          required
          value={departmentId}
          onChange={(e) => setDepartmentId(e.target.value)}
          className="rounded border px-3 py-2"
        >
          <option value="">Select department</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      )}
      {role === "DOCTOR" && (
        <p className="text-xs text-black/50 dark:text-white/50">
          Doctor accounts require admin approval before appearing in search.
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="rounded bg-foreground px-4 py-2 text-background disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create account"}
      </button>
    </form>
  );
}
