
import { PrismaClient } from "@prisma/client";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const prisma = new PrismaClient();

const rl = createInterface({ input: stdin, output: stdout });

async function main() {
  try {
    const email = (
      await rl.question("Enter your own Google account email: ")
    ).trim().toLowerCase();

    if (!email) {
      throw new Error("Email is required.");
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      throw new Error("No WattWise account found for this email.");
    }

    const orphanAppliances = await prisma.appliance.count({
      where: { userId: null },
    });

    const legacySettings = await prisma.settings.findUnique({
      where: { id: "default" },
    });

    const existingSettings = await prisma.settings.findUnique({
      where: { userId: user.id },
    });

    console.log("\nTransfer preview");
    console.log("----------------");
    console.log("Account:", user.email);
    console.log("Unassigned appliances:", orphanAppliances);
    console.log(
      "Legacy tariff:",
      legacySettings ? `${legacySettings.tariffPerKwh} per kWh` : "Not found"
    );

    if (legacySettings?.userId) {
      throw new Error(
        "The legacy settings row is already assigned. No changes made."
      );
    }

    if (existingSettings && !legacySettings) {
      console.log("Your account already has settings. Nothing to transfer.");
      return;
    }

    const confirmation = await rl.question(
      '\nType CLAIM to transfer the unassigned data to this account: '
    );

    if (confirmation.trim() !== "CLAIM") {
      console.log("Cancelled. No changes made.");
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.appliance.updateMany({
        where: { userId: null },
        data: { userId: user.id },
      });

      if (legacySettings) {
        if (existingSettings) {
          // Preserve the old tariff in the account's existing settings.
          await tx.settings.update({
            where: { userId: user.id },
            data: { tariffPerKwh: legacySettings.tariffPerKwh },
          });

          await tx.settings.delete({
            where: { id: legacySettings.id },
          });
        } else {
          // Keep the original settings row and its tariff.
          await tx.settings.update({
            where: { id: legacySettings.id },
            data: { userId: user.id },
          });
        }
      }
    });

    console.log("\nTransfer completed successfully!");
    console.log("Account:", user.email);
    console.log("Appliances transferred:", orphanAppliances);
    console.log(
      "Tariff preserved:",
      legacySettings ? `${legacySettings.tariffPerKwh} per kWh` : "No legacy tariff"
    );
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("\nTransfer stopped:", error.message);
  process.exitCode = 1;
});
