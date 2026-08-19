import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const schema = z.object({
  patientName: z.string().min(1),
  summary: z.string().min(1),
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

  const report = await prisma.operationReport.create({
    data: { doctorId: doctor.id, patientName: parsed.data.patientName, summary: parsed.data.summary },
  });
  return NextResponse.json(report);
}

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const reports = await prisma.operationReport.findMany({
    include: { doctor: { include: { user: true } } },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(reports);
}
