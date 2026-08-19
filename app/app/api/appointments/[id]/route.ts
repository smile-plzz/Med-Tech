import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const ALLOWED = ["PENDING", "APPROVED", "REJECTED", "COMPLETED", "CANCELLED"] as const;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "DOCTOR")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const { status } = await req.json();
  if (!ALLOWED.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  if (session.role === "DOCTOR") {
    const doctor = await prisma.doctor.findUnique({ where: { userId: session.userId } });
    const appt = await prisma.appointment.findUnique({ where: { id } });
    if (!doctor || !appt || appt.doctorId !== doctor.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const appointment = await prisma.appointment.update({ where: { id }, data: { status } });
  return NextResponse.json(appointment);
}
