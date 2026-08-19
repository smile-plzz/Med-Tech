import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  const departmentId = req.nextUrl.searchParams.get("departmentId") ?? undefined;
  const includeUnapproved = session?.role === "ADMIN";

  const doctors = await prisma.doctor.findMany({
    where: {
      ...(departmentId ? { departmentId } : {}),
      ...(includeUnapproved ? {} : { approved: true }),
    },
    include: { user: true, department: true },
    orderBy: { id: "asc" },
  });

  return NextResponse.json(
    doctors.map((d) => ({
      id: d.id,
      name: d.user.name,
      email: d.user.email,
      department: d.department.name,
      chamber: d.chamber,
      fee: d.fee,
      approved: d.approved,
    }))
  );
}
