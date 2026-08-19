"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SessionPayload } from "@/lib/auth";

const DASHBOARD_PATH: Record<SessionPayload["role"], string> = {
  ADMIN: "/dashboard/admin",
  DOCTOR: "/dashboard/doctor",
  PATIENT: "/dashboard/patient",
};

export default function NavBar({ session }: { session: SessionPayload | null }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold">
          Med-Tech
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/doctors">Doctors</Link>
          {session ? (
            <>
              <Link href={DASHBOARD_PATH[session.role]}>Dashboard</Link>
              {session.role === "DOCTOR" && <Link href="/ocr">OCR</Link>}
              <span className="text-black/50 dark:text-white/50">{session.name}</span>
              <button onClick={logout} className="underline">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login">Log in</Link>
              <Link href="/register">Register</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
