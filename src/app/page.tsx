"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  IndianRupee,
  Lightbulb,
  LoaderCircle,
  Plug,
  RefreshCw,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Appliance = {
  id: string;
  name: string;
  category: string;
  wattage: number;
  quantity: number;
  hoursPerDay: number;
};

type Settings = {
  tariffPerKwh: number;
};

export default function Dashboard() {
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [tariff, setTariff] = useState(8);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const [appliancesResponse, settingsResponse] = await Promise.all([
        fetch("/api/appliances"),
        fetch("/api/settings"),
      ]);

      if (!appliancesResponse.ok || !settingsResponse.ok) {
        throw new Error("Unable to load dashboard data.");
      }

      const applianceData: Appliance[] = await appliancesResponse.json();
      const settingsData: Settings = await settingsResponse.json();

      setAppliances(applianceData);
      setTariff(settingsData.tariffPerKwh);
    } catch {
      setError("Could not connect to the database. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  const totals = useMemo(() => {
    const dailyKwh = appliances.reduce(
      (sum, item) =>
        sum + (item.wattage * item.quantity * item.hoursPerDay) / 1000,
      0,
    );

    return {
      dailyKwh,
      monthlyKwh: dailyKwh * 30,
      monthlyCost: dailyKwh * 30 * tariff,
      yearlyCost: dailyKwh * 365 * tariff,
    };
  }, [appliances, tariff]);

const chartData = useMemo(
  () =>
    Array.from({ length: 7 }, (_, index) => ({
      day: `Day ${index + 1}`,
      consumption: Number(totals.dailyKwh.toFixed(2)),
    })),
  [totals.dailyKwh],
);

  const currency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-50 text-stone-600">
        <LoaderCircle className="mr-2 animate-spin" size={20} />
        Loading your energy data...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f3] text-stone-900">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-wide text-emerald-700">
              WATTWISE / ENERGY OVERVIEW
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Your energy, understood.
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-stone-500">
              See where electricity goes and what it may cost over the month.
            </p>
          </div>

          <button
            onClick={() => void loadDashboard()}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium shadow-sm transition hover:bg-stone-100"
          >
            <RefreshCw size={16} />
            Refresh data
          </button>
        </header>

        {error && (
          <div className="mt-6 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
            <button
              onClick={() => void loadDashboard()}
              className="font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        <section className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Estimated monthly cost"
            value={currency(totals.monthlyCost)}
            note={`At ₹${tariff}/kWh`}
            icon={<IndianRupee size={19} />}
            accent
          />
          <MetricCard
            title="Monthly consumption"
            value={`${totals.monthlyKwh.toFixed(1)} kWh`}
            note="Based on 30 days"
            icon={<Zap size={19} />}
          />
          <MetricCard
            title="Daily consumption"
            value={`${totals.dailyKwh.toFixed(2)} kWh`}
            note="From your appliance usage"
            icon={<Activity size={19} />}
          />
          <MetricCard
            title="Tracked appliances"
            value={String(appliances.length)}
            note="Saved in your database"
            icon={<Plug size={19} />}
          />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">Consumption projection</h2>
                <p className="mt-1 text-sm text-stone-500">
                  Estimated cumulative usage over seven days
                </p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
                <Activity className="mr-1 inline" size={13} />
                Usage estimate
              </span>
            </div>

            <div className="mt-6 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="usageFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0f766e" stopOpacity={0.22} />
                      <stop offset="100%" stopColor="#0f766e" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e7e5e4" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#78716c", fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "#78716c", fontSize: 12 }} width={45} />
                  <Tooltip
                    formatter={(value) => [`${value} kWh`, "Consumption"]}
                    contentStyle={{ borderRadius: 12, borderColor: "#e7e5e4" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="consumption"
                    stroke="#0f766e"
                    strokeWidth={2.5}
                    fill="url(#usageFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-xs leading-5 text-stone-400">
              This is a projection from your entered daily usage, not historical
              meter readings.
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="font-semibold">Your energy snapshot</h2>
            <p className="mt-1 text-sm text-stone-500">
              A quick breakdown of your current setup
            </p>

            <div className="mt-6 space-y-5">
              <SnapshotRow
                icon={<Lightbulb size={18} />}
                label="Connected appliances"
                value={String(appliances.reduce((sum, item) => sum + item.quantity, 0))}
              />
              <SnapshotRow
                icon={<ArrowUpRight size={18} />}
                label="Estimated yearly cost"
                value={currency(totals.yearlyCost)}
              />
              <SnapshotRow
                icon={<ArrowDownRight size={18} />}
                label="Average daily cost"
                value={currency(totals.dailyKwh * tariff)}
              />
            </div>

            <div className="mt-7 rounded-xl bg-[#f0f5ef] p-4">
              <p className="text-sm font-semibold text-emerald-950">
                A useful first step
              </p>
              <p className="mt-1 text-sm leading-6 text-emerald-900/75">
                Add the wattage and daily running hours of your appliances for
                a more meaningful estimate.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Your appliances</h2>
              <p className="mt-1 text-sm text-stone-500">
                Usage estimates for each saved appliance
              </p>
            </div>
            <span className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-600">
              {appliances.length} tracked
            </span>
          </div>

          {appliances.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-stone-300 px-5 py-10 text-center">
              <Plug className="mx-auto text-stone-400" size={26} />
              <p className="mt-3 font-medium">Nothing tracked yet</p>
              <p className="mt-1 text-sm text-stone-500">
                Your saved appliances will appear here once you add them.
              </p>
              <a
                href="/appliances"
                className="mt-4 inline-flex rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stone-700"
              >
                Add your first appliance
              </a>
            </div>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-200 text-xs uppercase tracking-wide text-stone-500">
                    <th className="pb-3 pr-4 font-medium">Appliance</th>
                    <th className="pb-3 pr-4 font-medium">Power</th>
                    <th className="pb-3 pr-4 font-medium">Daily use</th>
                    <th className="pb-3 pr-4 font-medium">Monthly usage</th>
                    <th className="pb-3 font-medium">Est. cost</th>
                  </tr>
                </thead>
                <tbody>
                  {appliances.map((item) => {
                    const daily =
                      (item.wattage * item.quantity * item.hoursPerDay) / 1000;
                    const monthly = daily * 30;

                    return (
                      <tr key={item.id} className="border-b border-stone-100 last:border-0">
                        <td className="py-4 pr-4">
                          <p className="font-medium">{item.name}</p>
                          <p className="mt-1 text-xs text-stone-500">{item.category}</p>
                        </td>
                        <td className="py-4 pr-4 text-stone-600">
                          {item.wattage} W × {item.quantity}
                        </td>
                        <td className="py-4 pr-4 text-stone-600">
                          {item.hoursPerDay} hrs
                        </td>
                        <td className="py-4 pr-4 font-medium">
                          {monthly.toFixed(2)} kWh
                        </td>
                        <td className="py-4 font-medium">
                          {currency(monthly * tariff)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="mt-8 flex flex-col gap-2 border-t border-stone-200 pt-5 text-xs leading-5 text-stone-500 sm:flex-row sm:items-center sm:justify-between">
          <span>WattWise · Practical insights for everyday energy use</span>
          <span>Estimates exclude fixed charges, taxes, and tariff slabs.</span>
        </footer>
      </div>
    </main>
  );
}

function MetricCard({
  title,
  value,
  note,
  icon,
  accent = false,
}: {
  title: string;
  value: string;
  note: string;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${
        accent
          ? "border-emerald-900 bg-emerald-950 text-white"
          : "border-stone-200 bg-white text-stone-900"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className={`text-sm ${accent ? "text-emerald-100/75" : "text-stone-500"}`}>
          {title}
        </p>
        <span
          className={`rounded-xl p-2 ${
            accent ? "bg-white/10 text-emerald-100" : "bg-stone-100 text-stone-700"
          }`}
        >
          {icon}
        </span>
      </div>
      <p className="mt-5 text-2xl font-semibold tracking-tight">{value}</p>
      <p className={`mt-2 text-xs ${accent ? "text-emerald-100/70" : "text-stone-500"}`}>
        {note}
      </p>
    </div>
  );
}

function SnapshotRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="rounded-lg bg-stone-100 p-2 text-stone-600">
          {icon}
        </span>
        <span className="text-sm text-stone-600">{label}</span>
      </div>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}
