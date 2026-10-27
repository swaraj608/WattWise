import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const applianceSchema = z.object({
  name: z.string().trim().min(1).max(100),
  category: z.string().trim().min(1).max(50),
  wattage: z.number().positive().max(100000),
  quantity: z.number().int().positive().max(1000),
  hoursPerDay: z.number().min(0).max(24),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

// Update an appliance
export async function PUT(
  request: Request,
  { params }: RouteContext,
) {
  try {
    const { id } = await params;
    const body: unknown = await request.json();
    const parsed = applianceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid appliance details." },
        { status: 400 },
      );
    }

    const existing = await prisma.appliance.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Appliance not found." },
        { status: 404 },
      );
    }

    const appliance = await prisma.appliance.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json(appliance);
  } catch {
    return NextResponse.json(
      { error: "Unable to update appliance." },
      { status: 500 },
    );
  }
}

// Delete an appliance
export async function DELETE(
  _request: Request,
  { params }: RouteContext,
) {
  try {
    const { id } = await params;

    const existing = await prisma.appliance.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Appliance not found." },
        { status: 404 },
      );
    }

    await prisma.appliance.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Appliance deleted successfully.",
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to delete appliance." },
      { status: 500 },
    );
  }
}
