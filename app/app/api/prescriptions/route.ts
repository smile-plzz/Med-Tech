import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const schema = z.object({
  appointmentId: z.string(),
  medication: z.string().min(1),
  notes: z.string().optional(),
  ocrSourceText: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "DOCTOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const doctor = await prisma.doctor.findUnique({ where: { userId: session.userId } });
  if (!doctor) return NextResponse.json({ error: "Doctor profile missing" }, { status: 400 });

  const appointment = await prisma.appointment.findUnique({ where: { id: parsed.data.appointmentId } });
  if (!appointment || appointment.doctorId !== doctor.id) {
    return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
  }

  const prescription = await prisma.prescription.upsert({
    where: { appointmentId: appointment.id },
    update: {
      medication: parsed.data.medication,
      notes: parsed.data.notes,
      ocrSourceText: parsed.data.ocrSourceText,
    },
    create: {
      appointmentId: appointment.id,
      doctorId: doctor.id,
      patientId: appointment.patientId,
      medication: parsed.data.medication,
      notes: parsed.data.notes,
      ocrSourceText: parsed.data.ocrSourceText,
    },
  });

  await prisma.appointment.update({ where: { id: appointment.id }, data: { status: "COMPLETED" } });

  return NextResponse.json(prescription);
}
