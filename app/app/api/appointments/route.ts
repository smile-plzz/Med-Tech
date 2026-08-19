import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const schema = z.object({
  doctorId: z.string(),
  date: z.string(),
  timeSlot: z.string(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const patient = await prisma.patient.findUnique({ where: { userId: session.userId } });
  if (!patient) return NextResponse.json({ error: "Patient profile missing" }, { status: 400 });

  const doctor = await prisma.doctor.findUnique({ where: { id: parsed.data.doctorId } });
  if (!doctor || !doctor.approved) {
    return NextResponse.json({ error: "Doctor not available" }, { status: 400 });
  }

  const appointment = await prisma.appointment.create({
    data: {
      doctorId: doctor.id,
      patientId: patient.id,
      date: new Date(parsed.data.date),
      timeSlot: parsed.data.timeSlot,
    },
  });

  if (doctor.fee > 0) {
    await prisma.transaction.create({
      data: { appointmentId: appointment.id, amount: doctor.fee },
    });
  }

  return NextResponse.json(appointment);
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.role === "ADMIN") {
    const appointments = await prisma.appointment.findMany({
      include: { doctor: { include: { user: true } }, patient: { include: { user: true } }, transaction: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(appointments);
  }

  if (session.role === "DOCTOR") {
    const doctor = await prisma.doctor.findUnique({ where: { userId: session.userId } });
    if (!doctor) return NextResponse.json([]);
    const appointments = await prisma.appointment.findMany({
      where: { doctorId: doctor.id },
      include: { patient: { include: { user: true } }, transaction: true, prescription: true },
      orderBy: { date: "asc" },
    });
    return NextResponse.json(appointments);
  }

  const patient = await prisma.patient.findUnique({ where: { userId: session.userId } });
  if (!patient) return NextResponse.json([]);
  const appointments = await prisma.appointment.findMany({
    where: { patientId: patient.id },
    include: { doctor: { include: { user: true, department: true } }, transaction: true, prescription: true, feedback: true },
    orderBy: { date: "asc" },
  });
  return NextResponse.json(appointments);
}
