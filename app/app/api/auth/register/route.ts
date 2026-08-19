import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["PATIENT", "DOCTOR"]),
  departmentId: z.string().optional(),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { name, email, password, role, departmentId, phone } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  if (role === "DOCTOR" && !departmentId) {
    return NextResponse.json({ error: "departmentId required for doctors" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      password: hashed,
      role,
      ...(role === "PATIENT"
        ? { patient: { create: {} } }
        : { doctor: { create: { departmentId: departmentId!, approved: false } } }),
    },
  });

  await setSessionCookie({ userId: user.id, role: user.role, name: user.name });

  return NextResponse.json({ id: user.id, role: user.role });
}
