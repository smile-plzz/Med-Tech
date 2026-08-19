import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();
  const data: { approved?: boolean; chamber?: string; fee?: number } = {};
  if (typeof body.approved === "boolean") data.approved = body.approved;
  if (typeof body.chamber === "string") data.chamber = body.chamber;
  if (typeof body.fee === "number") data.fee = body.fee;

  const doctor = await prisma.doctor.update({ where: { id }, data });
  return NextResponse.json(doctor);
}
