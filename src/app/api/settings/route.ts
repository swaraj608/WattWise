
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-current-user";

const settingsSchema = z.object({
  tariffPerKwh: z.number().positive().max(10000),
});

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Please sign in to view settings." },
        { status: 401 }
      );
    }

    let settings = await prisma.settings.findUnique({
      where: { userId: user.id },
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          userId: user.id,
          tariffPerKwh: 8,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("GET /api/settings failed:", error);

    return NextResponse.json(
      { error: "Unable to load electricity settings." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Please sign in to update settings." },
        { status: 401 }
      );
    }

    const body: unknown = await request.json();
    const parsed = settingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Enter a valid electricity tariff." },
        { status: 400 }
      );
    }

    const settings = await prisma.settings.upsert({
      where: { userId: user.id },
      update: {
        tariffPerKwh: parsed.data.tariffPerKwh,
      },
      create: {
        userId: user.id,
        tariffPerKwh: parsed.data.tariffPerKwh,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("PUT /api/settings failed:", error);

    return NextResponse.json(
      { error: "Unable to update electricity settings." },
      { status: 500 }
    );
  }
}
