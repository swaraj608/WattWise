
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-current-user";

const applianceSchema = z.object({
  name: z.string().trim().min(1).max(100),
  category: z.string().trim().min(1).max(50),
  wattage: z.number().positive().max(100000),
  quantity: z.number().int().positive().max(1000).default(1),
  hoursPerDay: z.number().min(0).max(24),
});

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Please sign in to view appliances." },
        { status: 401 }
      );
    }

    const appliances = await prisma.appliance.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(appliances);
  } catch (error) {
    console.error("GET /api/appliances failed:", error);

    return NextResponse.json(
      { error: "Unable to load appliances." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Please sign in to add appliances." },
        { status: 401 }
      );
    }

    const body: unknown = await request.json();
    const parsed = applianceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid appliance details.",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const appliance = await prisma.appliance.create({
      data: {
        ...parsed.data,
        userId: user.id,
      },
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
