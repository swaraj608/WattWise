
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  IndianRupee,
  LoaderCircle,
  RotateCcw,
  Save,
  Zap,
} from "lucide-react";

type Settings = {
  id?: string;
  tariffPerKwh: number;
};

type Appliance = {
  wattage: number;
  quantity: number;
  hoursPerDay: number;
};

const DEFAULT_TARIFF = 8;

export default function SettingsPage() {
  const [tariff, setTariff] = useState(String(DEFAULT_TARIFF));
  const [savedTariff, setSavedTariff] = useState(DEFAULT_TARIFF);
  const [applianceCount, setApplianceCount] = useState(0);
  const [monthlyKwh, setMonthlyKwh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const [settingsResponse, appliancesResponse] = await Promise.all([
        fetch("/api/settings", { cache: "no-store" }),
        fetch("/api/appliances", { cache: "no-store" }),
      ]);

      if (!settingsResponse.ok) {
        throw new Error("Could not load tariff settings.");
      }

      const settings: Settings = await settingsResponse.json();

      if (
        typeof settings.tariffPerKwh !== "number" ||
        !Number.isFinite(settings.tariffPerKwh)
      ) {
        throw new Error("The saved tariff value is invalid.");
      }

      setTariff(String(settings.tariffPerKwh));
      setSavedTariff(settings.tariffPerKwh);

      if (appliancesResponse.ok) {
        const appliances: Appliance[] = await appliancesResponse.json();

        if (Array.isArray(appliances)) {
          const dailyKwh = appliances.reduce((total, appliance) => {
            return (
              total +
              (appliance.wattage *
                appliance.quantity *
                appliance.hoursPerDay) /
                1000
            );
          }, 0);

          setApplianceCount(appliances.length);
          setMonthlyKwh(dailyKwh * 30);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading settings.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const numericTariff = Number(tariff);
  const validTariff =
    tariff.trim() !== "" &&
    Number.isFinite(numericTariff) &&
    numericTariff > 0 &&
    numericTariff <= 10000;

  const previewCost = validTariff ? monthlyKwh * numericTariff : 0;
  const savedMonthlyCost = monthlyKwh * savedTariff;

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!validTariff) {
      setError("Enter a rate greater than ₹0 and no more than ₹10,000 per kWh.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tariffPerKwh: numericTariff,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.error ?? "Could not save your tariff.");
      }

      const updatedTariff =
        typeof result.tariffPerKwh === "number"
          ? result.tariffPerKwh
          : numericTariff;

      setTariff(String(updatedTariff));
      setSavedTariff(updatedTariff);
      setSuccess("Your electricity tariff has been saved successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save your tariff.",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setTariff(String(savedTariff));
    setError("");
    setSuccess("");
  }

  return (
    <main className="min-h-screen bg-[#f8f7f4] px-5 py-8 text-[#25251f] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[#77766e] transition hover:text-[#5e4b35]"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>

        <header>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#82715c]">
            WattWise / Preferences
          </p>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Electricity settings
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#77766e]">
            Set your electricity rate to estimate how much your appliances
            could cost to run. Your saved rate is stored in your database.
          </p>
        </header>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mt-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
          >
            <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
            {success}
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-2xl border border-[#e8e3da] bg-white p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-[#f2eee6] text-[#655642]">
                <IndianRupee size={21} />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Electricity tariff</h2>
                <p className="mt-1 text-sm text-[#77766e]">
                  Cost per kilowatt-hour (kWh)
                </p>
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-48 items-center justify-center gap-3 text-sm text-[#77766e]">
                <LoaderCircle size={19} className="animate-spin" />
                Loading your settings...
              </div>
            ) : (
              <form onSubmit={handleSave} className="mt-8 space-y-6">
                <div>
                  <label
                    htmlFor="tariff"
                    className="mb-2 block text-sm font-medium text-[#514f47]"
                  >
                    Rate per unit (₹/kWh)
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[#82715c]">
                      ₹
                    </span>

                    <input
                      id="tariff"
                      name="tariff"
                      type="number"
                      min="0.01"
                      max="10000"
                      step="0.01"
                      required
                      value={tariff}
                      onChange={(event) => {
                        setTariff(event.target.value);
                        setError("");
                        setSuccess("");
                      }}
                      className="w-full rounded-xl border border-[#e5e0d7] bg-[#fdfcfb] py-4 pl-10 pr-4 text-2xl font-semibold outline-none transition focus:border-[#8b7960] focus:ring-2 focus:ring-[#8b7960]/10"
                      placeholder="8.00"
                    />
                  </div>

                  <p className="mt-2 text-xs leading-5 text-[#918d83]">
                    Check your electricity bill for the applicable rate.
                    Actual bills may include additional charges and slabs.
                  </p>
                </div>

                <div className="rounded-xl bg-[#f8f7f4] p-4">
                  <p className="text-sm text-[#77766e]">
                    Estimated monthly cost at this rate
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight">
                    ₹
                    {previewCost.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p className="mt-2 text-xs text-[#918d83]">
                    Based on {monthlyKwh.toFixed(2)} kWh over 30 days
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={saving || !validTariff}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#655642] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#50432f] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <LoaderCircle size={17} className="animate-spin" />
                    ) : (
                      <Save size={17} />
                    )}
                    {saving ? "Saving..." : "Save settings"}
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#e5e0d7] px-4 py-3 text-sm font-medium transition hover:bg-[#f8f7f4] disabled:opacity-50"
                  >
                    <RotateCcw size={16} />
                    Reset changes
                  </button>
                </div>
              </form>
            )}
          </section>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-[#e8e3da] bg-white p-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#f2eee6] text-[#655642]">
                <Zap size={20} />
              </div>

              <h2 className="mt-4 text-lg font-semibold">Your usage snapshot</h2>
              <p className="mt-1 text-sm text-[#77766e]">
                Based on the appliances currently saved in WattWise.
              </p>

              <div className="mt-6 space-y-4">
                <SnapshotRow
                  label="Tracked appliances"
                  value={String(applianceCount)}
                />
                <SnapshotRow
                  label="Monthly consumption"
                  value={`${monthlyKwh.toFixed(2)} kWh`}
                />
                <SnapshotRow
                  label="Saved monthly estimate"
                  value={`₹${savedMonthlyCost.toLocaleString("en-IN", {
                    maximumFractionDigits: 2,
                  })}`}
                />
                <SnapshotRow
                  label="New monthly estimate"
                  value={`₹${previewCost.toLocaleString("en-IN", {
                    maximumFractionDigits: 2,
                  })}`}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-[#e8e3da] bg-[#eee8dc] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#75644d]">
                How it works
              </p>
              <h2 className="mt-3 text-lg font-semibold">
                Simple, transparent estimates
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#6f685d]">
                Monthly energy is calculated from appliance wattage, quantity
                and daily hours, multiplied by 30 days. The total is then
                multiplied by your tariff.
              </p>
              <div className="mt-4 rounded-xl border border-[#dcd2c1] bg-white/60 p-3 text-sm font-medium text-[#514633]">
                Monthly kWh × Tariff = Estimated cost
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function SnapshotRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#f0ede7] pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-[#77766e]">{label}</span>
      <span className="text-right text-sm font-semibold text-[#302f29]">
        {value}
      </span>
    </div>
  );
}
