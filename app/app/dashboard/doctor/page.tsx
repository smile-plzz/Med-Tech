import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AppointmentActions from "@/components/AppointmentActions";
import PrescriptionForm from "@/components/PrescriptionForm";

export default async function DoctorDashboard() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "DOCTOR") redirect(`/dashboard/${session.role.toLowerCase()}`);

  const doctor = await prisma.doctor.findUnique({ where: { userId: session.userId } });
  const appointments = doctor
    ? await prisma.appointment.findMany({
        where: { doctorId: doctor.id },
        include: { patient: { include: { user: true } }, prescription: true },
        orderBy: { date: "asc" },
      })
    : [];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">My patients</h1>
      {doctor && !doctor.approved && (
        <p className="rounded bg-yellow-100 p-3 text-sm text-yellow-800">
          Your account is pending admin approval. You will not appear in doctor search until approved.
        </p>
      )}
      {appointments.length === 0 && (
        <p className="text-black/60 dark:text-white/60">No appointments yet.</p>
      )}
      <div className="flex flex-col gap-4">
        {appointments.map((a) => (
          <div key={a.id} className="rounded border p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{a.patient.user.name}</p>
              <span className="rounded bg-black/5 px-2 py-0.5 text-xs dark:bg-white/10">{a.status}</span>
            </div>
            <p className="text-sm text-black/60 dark:text-white/60">
              {new Date(a.date).toLocaleDateString()} at {a.timeSlot}
            </p>
            <AppointmentActions appointmentId={a.id} status={a.status} />
            {(a.status === "APPROVED" || a.status === "COMPLETED") && (
              <PrescriptionForm appointmentId={a.id} existing={a.prescription} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
