import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const schema = z.object({
  appointmentId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
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

  const appointment = await prisma.appointment.findUnique({ where: { id: parsed.data.appointmentId } });
  if (!appointment || appointment.patientId !== patient.id) {
    return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
  }

  const feedback = await prisma.feedback.upsert({
    where: { appointmentId: appointment.id },
    update: { rating: parsed.data.rating, comment: parsed.data.comment },
    create: {
      appointmentId: appointment.id,
      patientId: patient.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    },
  });

  return NextResponse.json(feedback);
}
