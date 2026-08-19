import bcrypt from "bcryptjs";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "admin@medtech.dev";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    const password = await bcrypt.hash("admin123", 10);
    await prisma.user.create({
      data: { name: "Admin", email, password, role: "ADMIN" },
    });
    console.log(`Seeded admin: ${email} / admin123`);
  } else {
    console.log("Admin already exists");
  }

  const departments = ["General Medicine", "Cardiology", "Dermatology", "Pediatrics"];
  for (const name of departments) {
    await prisma.department.upsert({ where: { name }, update: {}, create: { name } });
  }
  console.log("Seeded departments");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
