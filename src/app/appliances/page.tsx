"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
  Zap,
  LoaderCircle,
  Plug,
} from "lucide-react";

type Appliance = {
  id: string;
  name: string;
  category: string;
  wattage: number;
  quantity: number;
  hoursPerDay: number;
};

type ApplianceForm = {
  name: string;
  category: string;
  wattage: string;
  quantity: string;
  hoursPerDay: string;
};

const initialForm: ApplianceForm = {
  name: "",
  category: "Other",
  wattage: "",
  quantity: "1",
  hoursPerDay: "4",
};

const categories = [
  "Cooling",
  "Lighting",
  "Kitchen",
  "Electronics",
  "Appliances",
  "Other",
];

function getDailyUsage(appliance: Appliance) {
  return (
    (appliance.wattage * appliance.quantity * appliance.hoursPerDay) / 1000
  );
}

function formatNumber(value: number) {
  return value.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
}

export default function AppliancesPage() {
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [tariff, setTariff] = useState(8);
  const [form, setForm] = useState<ApplianceForm>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [applianceResponse, settingsResponse] = await Promise.all([
        fetch("/api/appliances", { cache: "no-store" }),
        fetch("/api/settings", { cache: "no-store" }),
      ]);

      if (!applianceResponse.ok) {
        throw new Error("Could not load appliances.");
      }

      const applianceData: unknown = await applianceResponse.json();

      if (!Array.isArray(applianceData)) {
        throw new Error("Unexpected appliance data received.");
      }

      setAppliances(applianceData as Appliance[]);

      if (settingsResponse.ok) {
        const settings = await settingsResponse.json();
        if (
          typeof settings.tariffPerKwh === "number" &&
          Number.isFinite(settings.tariffPerKwh)
        ) {
          setTariff(settings.tariffPerKwh);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const totals = useMemo(() => {
    const daily = appliances.reduce(
      (sum, appliance) => sum + getDailyUsage(appliance),
      0,
    );

    return {
      daily,
      monthly: daily * 30,
      cost: daily * 30 * tariff,
    };
  }, [appliances, tariff]);

  const filteredAppliances = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return appliances;

    return appliances.filter((appliance) =>
      `${appliance.name} ${appliance.category}`
        .toLowerCase()
        .includes(query),
    );
  }, [appliances, search]);

  function openAddForm() {
    setEditingId(null);
    setForm(initialForm);
    setError("");
    setShowForm(true);
  }

  function openEditForm(appliance: Appliance) {
    setEditingId(appliance.id);
    setForm({
      name: appliance.name,
      category: appliance.category,
      wattage: String(appliance.wattage),
      quantity: String(appliance.quantity),
      hoursPerDay: String(appliance.hoursPerDay),
    });
    setError("");
    setShowForm(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const wattage = Number(form.wattage);
    const quantity = Number(form.quantity);
    const hoursPerDay = Number(form.hoursPerDay);

    if (
      !form.name.trim() ||
      !form.category.trim() ||
      !Number.isFinite(wattage) ||
      wattage <= 0 ||
      wattage > 100000 ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 1000 ||
      !Number.isFinite(hoursPerDay) ||
      hoursPerDay < 0 ||
      hoursPerDay > 24
    ) {
      setError("Please enter valid appliance details.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      category: form.category,
      wattage,
      quantity,
      hoursPerDay,
    };

    setSaving(true);

    try {
      const response = await fetch(
        editingId
          ? `/api/appliances/${encodeURIComponent(editingId)}`
          : "/api/appliances",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(
          result?.error ??
            (editingId
              ? "Could not update appliance."
              : "Could not add appliance."),
        );
      }

      setShowForm(false);
      setForm(initialForm);
      setEditingId(null);
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save appliance.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this appliance? This cannot be undone.")) {
      return;
    }

    setDeletingId(id);
    setError("");

    try {
      const response = await fetch(
        `/api/appliances/${encodeURIComponent(id)}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error ?? "Could not delete appliance.");
      }

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not delete appliance.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f7f4] px-5 py-8 text-[#25251f] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[#77766e] transition hover:text-[#5e4b35]"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>

        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#82715c]">
              WattWise / Your energy
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Appliances
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#77766e]">
              Keep track of what you use, how long you use it, and what it
              could cost each month.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddForm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#655642] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#50432f]"
          >
            <Plus size={17} />
            Add appliance
          </button>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <Metric
            label="Tracked appliances"
            value={String(appliances.length)}
            note="Items in your list"
            icon={<Plug size={18} />}
          />
          <Metric
            label="Daily consumption"
            value={`${formatNumber(totals.daily)} kWh`}
            note="Estimated per day"
            icon={<Zap size={18} />}
          />
          <Metric
            label="Monthly cost"
            value={`₹${formatNumber(totals.cost)}`}
            note={`At ₹${formatNumber(tariff)} per kWh · 30-day estimate`}
            icon={<span className="text-lg">₹</span>}
          />
        </section>

        {error && (
          <div
            role="alert"
            className="mt-6 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <span>{error}</span>
            <button
              type="button"
              aria-label="Dismiss error"
              onClick={() => setError("")}
            >
              <X size={17} />
            </button>
          </div>
        )}

        {showForm && (
          <section className="mt-8 rounded-2xl border border-[#e8e3da] bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">
                  {editingId ? "Edit appliance" : "Add an appliance"}
                </h2>
                <p className="mt-1 text-sm text-[#77766e]">
                  Enter the appliance details to estimate its energy use.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close form"
                onClick={() => {
                  setShowForm(false);
                  setError("");
                }}
                className="rounded-lg p-2 text-[#77766e] hover:bg-[#f5f2ed]"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Appliance name">
                  <input
                    required
                    maxLength={100}
                    placeholder="e.g. Ceiling fan"
                    value={form.name}
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Category">
                  <select
                    value={form.category}
                    onChange={(event) =>
                      setForm({ ...form, category: event.target.value })
                    }
                    className={inputClass}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Power rating (watts)">
                  <input
                    required
                    type="number"
                    min="0.1"
                    max="100000"
                    step="any"
                    placeholder="e.g. 75"
                    value={form.wattage}
                    onChange={(event) =>
                      setForm({ ...form, wattage: event.target.value })
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Number of units">
                  <input
                    required
                    type="number"
                    min="1"
                    max="1000"
                    step="1"
                    value={form.quantity}
                    onChange={(event) =>
                      setForm({ ...form, quantity: event.target.value })
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Hours used per day">
                  <input
                    required
                    type="number"
                    min="0"
                    max="24"
                    step="any"
                    value={form.hoursPerDay}
                    onChange={(event) =>
                      setForm({ ...form, hoursPerDay: event.target.value })
                    }
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="flex flex-wrap gap-3 border-t border-[#eeeae3] pt-5">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#655642] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#50432f] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && <LoaderCircle size={16} className="animate-spin" />}
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save changes"
                      : "Save appliance"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setError("");
                  }}
                  className="rounded-xl border border-[#e5e0d7] px-5 py-3 text-sm font-medium hover:bg-[#f8f7f4]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="mt-9">
          <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-semibold">Your appliance list</h2>
              <p className="mt-1 text-sm text-[#77766e]">
                {filteredAppliances.length}{" "}
                {filteredAppliances.length === 1 ? "item" : "items"} shown
              </p>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#918d83]"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search appliances..."
                aria-label="Search appliances"
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-48 items-center justify-center gap-3 rounded-2xl border border-[#e8e3da] bg-white text-sm text-[#77766e]">
              <LoaderCircle size={19} className="animate-spin" />
              Loading your appliances...
            </div>
          ) : filteredAppliances.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#d9d1c4] bg-white px-5 py-14 text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-[#f2eee6] text-[#655642]">
                <Plug size={22} />
              </div>
              <h3 className="text-lg font-semibold">
                {search ? "No matching appliances" : "Nothing tracked yet"}
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#77766e]">
                {search
                  ? "Try another name or category."
                  : "Add your first appliance to start estimating your electricity consumption."}
              </p>
              {!search && (
                <button
                  type="button"
                  onClick={openAddForm}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#655642] px-4 py-3 text-sm font-medium text-white hover:bg-[#50432f]"
                >
                  <Plus size={16} />
                  Add your first appliance
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-[#e8e3da] bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="border-b border-[#eeeae3] bg-[#fbfaf8] text-xs uppercase tracking-wider text-[#77766e]">
                    <tr>
                      <th className="px-5 py-4 font-medium">Appliance</th>
                      <th className="px-5 py-4 font-medium">Power</th>
                      <th className="px-5 py-4 font-medium">Daily use</th>
                      <th className="px-5 py-4 font-medium">Daily energy</th>
                      <th className="px-5 py-4 font-medium">Monthly cost</th>
                      <th className="px-5 py-4 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0ede7]">
                    {filteredAppliances.map((appliance) => {
                      const dailyKwh = getDailyUsage(appliance);
                      const monthlyCost = dailyKwh * 30 * tariff;

                      return (
                        <tr
                          key={appliance.id}
                          className="transition hover:bg-[#fcfbf9]"
                        >
                          <td className="px-5 py-4">
                            <div className="font-medium text-[#302f29]">
                              {appliance.name}
                            </div>
                            <div className="mt-1 text-xs text-[#918d83]">
                              {appliance.category} · Qty {appliance.quantity}
                            </div>
                          </td>
                          <td className="px-5 py-4 text-[#57564f]">
                            {formatNumber(appliance.wattage)} W
                          </td>
                          <td className="px-5 py-4 text-[#57564f]">
                            {formatNumber(appliance.hoursPerDay)} h/day
                          </td>
                          <td className="px-5 py-4 font-medium">
                            {formatNumber(dailyKwh)} kWh
                          </td>
                          <td className="px-5 py-4 font-medium">
                            ₹{formatNumber(monthlyCost)}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => openEditForm(appliance)}
                                aria-label={`Edit ${appliance.name}`}
                                className="rounded-lg border border-[#e8e3da] p-2 text-[#655642] transition hover:bg-[#f2eee6]"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(appliance.id)}
                                disabled={deletingId === appliance.id}
                                aria-label={`Delete ${appliance.name}`}
                                className="rounded-lg border border-[#f0d8d5] p-2 text-[#b34e43] transition hover:bg-[#fff0ee] disabled:opacity-50"
                              >
                                {deletingId === appliance.id ? (
                                  <LoaderCircle
                                    size={16}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Trash2 size={16} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <p className="mt-4 text-xs leading-5 text-[#918d83]">
            Estimates assume 30 days per month and the configured tariff.
            Actual electricity bills may differ.
          </p>
        </section>
      </div>
    </main>
  );
}

const inputClass =
  "w-full rounded-xl border border-[#e5e0d7] bg-white px-3.5 py-3 text-sm text-[#302f29] outline-none transition placeholder:text-[#aaa59a] focus:border-[#8b7960] focus:ring-2 focus:ring-[#8b7960]/10";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-[#514f47]">{label}</span>
      {children}
    </label>
  );
}

function Metric({
  label,
  value,
  note,
  icon,
}: {
  label: string;
  value: string;
  note: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#e8e3da] bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-[#77766e]">{label}</p>
        <span className="flex size-9 items-center justify-center rounded-xl bg-[#f2eee6] text-[#655642]">
          {icon}
        </span>
      </div>
      <p className="mt-5 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-[#918d83]">{note}</p>
    </div>
  );
}