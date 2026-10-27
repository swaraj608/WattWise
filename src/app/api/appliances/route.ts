
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const applianceSchema = z.object({
  name: z.string().trim().min(1).max(100),
  category: z.string().trim().min(1).max(50),
  wattage: z.number().positive().max(100000),
  quantity: z.number().int().positive().max(1000).default(1),
  hoursPerDay: z.number().min(0).max(24),
});

export async function GET() {
  try {
    const appliances = await prisma.appliance.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(appliances);
  } catch {
    return NextResponse.json(
      { error: "Unable to load appliances." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = applianceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid appliance details.", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const appliance = await prisma.appliance.create({
      data: parsed.data,
    });

    return NextResponse.json(appliance, { status: 201 });
  } catch (error) {
  console.error("POST /api/appliances failed:", error);

  return NextResponse.json(
    { error: "Unable to create appliance." },
    { status: 500 }
  );
}
}
