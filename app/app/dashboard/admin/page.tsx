import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DepartmentForm from "@/components/DepartmentForm";
import DoctorApproval from "@/components/DoctorApproval";

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect(`/dashboard/${session.role.toLowerCase()}`);

  const [departments, doctors, appointments, transactions] = await Promise.all([
    prisma.department.findMany({ orderBy: { name: "asc" } }),
    prisma.doctor.findMany({ include: { user: true, department: true }, orderBy: { id: "asc" } }),
    prisma.appointment.count(),
    prisma.transaction.aggregate({ _sum: { amount: true } }),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <h1 className="text-2xl font-bold">Admin</h1>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded border p-4">
          <p className="text-sm text-black/60 dark:text-white/60">Total appointments</p>
          <p className="text-2xl font-semibold">{appointments}</p>
        </div>
        <div className="rounded border p-4">
          <p className="text-sm text-black/60 dark:text-white/60">Total revenue</p>
          <p className="text-2xl font-semibold">৳{transactions._sum.amount ?? 0}</p>
        </div>
        <div className="rounded border p-4">
          <p className="text-sm text-black/60 dark:text-white/60">Departments</p>
          <p className="text-2xl font-semibold">{departments.length}</p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Departments</h2>
        <ul className="flex flex-wrap gap-2 text-sm">
          {departments.map((d) => (
            <li key={d.id} className="rounded bg-black/5 px-3 py-1 dark:bg-white/10">
              {d.name}
            </li>
          ))}
        </ul>
        <DepartmentForm />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Doctors</h2>
        <div className="flex flex-col gap-2">
          {doctors.map((d) => (
            <div key={d.id} className="flex items-center justify-between rounded border p-3">
              <div>
                <p className="font-medium">{d.user.name}</p>
                <p className="text-sm text-black/60 dark:text-white/60">
                  {d.department.name} — {d.user.email}
                </p>
              </div>
              <DoctorApproval doctorId={d.id} approved={d.approved} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
