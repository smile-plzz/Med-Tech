import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import FeedbackForm from "@/components/FeedbackForm";

export default async function PatientDashboard() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "PATIENT") redirect(`/dashboard/${session.role.toLowerCase()}`);

  const patient = await prisma.patient.findUnique({ where: { userId: session.userId } });
  const appointments = patient
    ? await prisma.appointment.findMany({
        where: { patientId: patient.id },
        include: {
          doctor: { include: { user: true, department: true } },
          transaction: true,
          prescription: true,
          feedback: true,
        },
        orderBy: { date: "desc" },
      })
    : [];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">My appointments</h1>
      {appointments.length === 0 && (
        <p className="text-black/60 dark:text-white/60">
          No appointments yet. Browse the <a href="/doctors" className="underline">doctor list</a> to book one.
        </p>
      )}
      <div className="flex flex-col gap-4">
        {appointments.map((a) => (
          <div key={a.id} className="rounded border p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold">
                {a.doctor.user.name} — {a.doctor.department.name}
              </p>
              <span className="rounded bg-black/5 px-2 py-0.5 text-xs dark:bg-white/10">{a.status}</span>
            </div>
            <p className="text-sm text-black/60 dark:text-white/60">
              {new Date(a.date).toLocaleDateString()} at {a.timeSlot}
            </p>
            {a.transaction && <p className="text-sm">Paid: ৳{a.transaction.amount}</p>}
            {a.prescription && (
              <div className="mt-2 rounded bg-black/5 p-2 text-sm dark:bg-white/10">
                <p className="font-medium">Prescription</p>
                <p>{a.prescription.medication}</p>
                {a.prescription.notes && <p className="text-black/60 dark:text-white/60">{a.prescription.notes}</p>}
              </div>
            )}
            {a.status === "COMPLETED" && !a.feedback && <FeedbackForm appointmentId={a.id} />}
            {a.feedback && (
              <p className="mt-2 text-sm text-black/60 dark:text-white/60">
                You rated this visit {a.feedback.rating}/5.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
