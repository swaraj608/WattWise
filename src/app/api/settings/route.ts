
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const settingsSchema = z.object({
  tariffPerKwh: z.number().positive().max(10000),
});

export async function GET() {
  try {
    const settings = await prisma.settings.upsert({
      where: { id: "default" },
      update: {},
      create: {
        id: "default",
        tariffPerKwh: 8,
      },
    });

    return NextResponse.json(settings);
  } catch {
    return NextResponse.json(
      { error: "Unable to load electricity settings." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = settingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Enter a valid electricity tariff." },
        { status: 400 },
      );
    }

    const settings = await prisma.settings.upsert({
      where: { id: "default" },
      update: {
        tariffPerKwh: parsed.data.tariffPerKwh,
      },
      create: {
        id: "default",
        tariffPerKwh: parsed.data.tariffPerKwh,
      },
    });

    return NextResponse.json(settings);
  } catch {
    return NextResponse.json(
      { error: "Unable to update electricity settings." },
      { status: 500 },
    );
  }
}
