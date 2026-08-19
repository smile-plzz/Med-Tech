import { prisma } from "@/lib/prisma";
import BookingForm from "@/components/BookingForm";
import { getSession } from "@/lib/auth";

export default async function DoctorsPage() {
  const [doctors, session] = await Promise.all([
    prisma.doctor.findMany({
      where: { approved: true },
      include: { user: true, department: true },
      orderBy: { id: "asc" },
    }),
    getSession(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Find a doctor</h1>
      {doctors.length === 0 && (
        <p className="text-black/60 dark:text-white/60">
          No approved doctors yet. Check back soon.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {doctors.map((d) => (
          <div key={d.id} className="rounded border p-4">
            <p className="font-semibold">{d.user.name}</p>
            <p className="text-sm text-black/60 dark:text-white/60">{d.department.name}</p>
            {d.chamber && <p className="text-sm">Chamber: {d.chamber}</p>}
            <p className="text-sm">Fee: {d.fee > 0 ? `৳${d.fee}` : "Free"}</p>
            {session?.role === "PATIENT" ? (
              <BookingForm doctorId={d.id} />
            ) : (
              <p className="mt-2 text-xs text-black/50 dark:text-white/50">
                Log in as a patient to book.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
