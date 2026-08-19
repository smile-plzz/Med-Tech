import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Med-Tech</h1>
      <p className="max-w-2xl text-black/70 dark:text-white/70">
        Online doctor consultation platform with OCR-assisted prescription digitization.
        Book appointments, manage records, and turn handwritten prescriptions into
        searchable text.
      </p>
      <div className="flex gap-4">
        <Link
          href="/doctors"
          className="rounded bg-foreground px-4 py-2 text-background"
        >
          Find a doctor
        </Link>
        <Link href="/register" className="rounded border px-4 py-2">
          Create account
        </Link>
      </div>
    </div>
  );
}
