
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Activity,
  Zap,
  Leaf,
  ShieldCheck,
  Lightbulb,
  BatteryCharging,
} from "lucide-react";

export default function Home() {
  return (
    <main className="relative h-[100svh] min-h-[620px] overflow-hidden bg-[#f7f8f4]">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -right-32 -top-40 h-[520px] w-[520px] rounded-full bg-emerald-100/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-48 -left-32 h-[480px] w-[480px] rounded-full bg-lime-100/50 blur-3xl" />

      {/* Navbar */}
      <nav className="relative z-10 mx-auto flex w-full max-w-[1440px] items-center justify-between px-6 py-5 sm:px-10 lg:px-16">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-lg shadow-emerald-900/15">
            <Zap size={23} fill="currentColor" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-stone-900">
            Watt<span className="text-emerald-700">Wise</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-full px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-white"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="group flex items-center gap-2 rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-900/15 transition hover:bg-emerald-800"
          >
            Get Started
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 mx-auto grid h-[calc(100svh-81px)] min-h-[539px] w-full max-w-[1440px] items-center gap-10 px-6 pb-8 pt-2 sm:px-10 lg:grid-cols-2 lg:px-16">
        {/* Left content */}
        <div className="relative z-10">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-xs font-semibold tracking-wide text-emerald-800 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            SMARTER ENERGY. BETTER LIVING.
          </div>

          <h1 className="max-w-[650px] text-[clamp(2.8rem,5.4vw,5.2rem)] font-bold leading-[1.04] tracking-[-0.055em] text-stone-900">
            Take control
            <br />
            of your energy.
            <br />
            <span className="text-emerald-700">Own your savings.</span>
          </h1>

          <p className="mt-7 max-w-[510px] text-base leading-8 text-stone-600 sm:text-lg">
            Understand where your electricity goes. Track appliance
            consumption, estimate your bills, and make smarter energy
            decisions — all in one place.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/register"
              className="group flex items-center gap-3 rounded-xl bg-emerald-700 px-7 py-4 text-sm font-semibold text-white shadow-xl shadow-emerald-900/15 transition hover:-translate-y-0.5 hover:bg-emerald-800"
            >
              Start tracking for free
              <ArrowUpRight
                size={18}
                className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </Link>
            <div className="flex items-center gap-2 text-sm font-medium text-stone-500">
              <ShieldCheck size={18} className="text-emerald-700" />
              Simple. Personal. Practical.
            </div>
          </div>

          <div className="mt-12 flex flex-wrap gap-x-8 gap-y-4 border-t border-stone-200 pt-6">
            <div className="flex items-center gap-2 text-sm text-stone-600">
              <Activity size={17} className="text-emerald-700" />
              Usage insights
            </div>
            <div className="flex items-center gap-2 text-sm text-stone-600">
              <Zap size={17} className="text-emerald-700" />
              Appliance tracking
            </div>
            <div className="flex items-center gap-2 text-sm text-stone-600">
              <Leaf size={17} className="text-emerald-700" />
              Smarter energy habits
            </div>
          </div>
        </div>

        {/* Right dashboard preview */}
        <div className="relative mx-auto w-full max-w-[540px] lg:ml-auto">
          <div className="absolute -right-7 -top-8 h-32 w-32 rounded-full border border-emerald-200/70" />
          <div className="absolute -bottom-8 -left-8 h-36 w-36 rounded-full border border-lime-200/80" />

          <div className="relative rounded-[28px] border border-white bg-white/90 p-4 shadow-[0_25px_90px_-25px_rgba(22,101,52,0.22)] backdrop-blur-xl sm:p-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-5">
              <div>
                <p className="text-xs font-medium text-stone-400">
                  YOUR ENERGY OVERVIEW
                </p>
                <h2 className="mt-1 text-xl font-bold text-stone-900">
                  Energy dashboard
                </h2>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <BatteryCharging size={22} />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#f2f7f1] p-4">
                <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
                  <Zap size={15} className="text-emerald-700" />
                  Daily usage
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-stone-900">8.4</span>
                  <span className="text-xs text-stone-500">kWh</span>
                </div>
                <p className="mt-2 text-xs text-emerald-700">
                  Monitor your usage
                </p>
              </div>

              <div className="rounded-2xl bg-[#f8f6ef] p-4">
                <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
                  <Activity size={15} className="text-amber-600" />
                  Estimated bill
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-stone-900">₹</span>
                  <span className="text-3xl font-bold text-stone-900">2,016</span>
                </div>
                <p className="mt-2 text-xs text-stone-500">
                  Monthly estimate
                </p>
              </div>
            </div>

            {/* Decorative chart preview */}
            <div className="mt-4 rounded-2xl border border-stone-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-stone-800">
                    Consumption trend
                  </p>
                  <p className="mt-1 text-xs text-stone-400">
                    A clearer view of your energy
                  </p>
                </div>
                <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                  Weekly
                </span>
              </div>

              <div className="mt-6 flex h-32 items-end justify-between gap-2 px-1">
                {[42, 65, 48, 82, 58, 72, 50].map((height, index) => (
                  <div
                    key={index}
                    className="flex h-full flex-1 items-end"
                  >
                    <div
                      className={`w-full rounded-t-lg ${
                        index === 3
                          ? "bg-emerald-700"
                          : "bg-emerald-200"
                      }`}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-3 flex justify-between text-[10px] font-medium text-stone-400">
                <span>MON</span>
                <span>TUE</span>
                <span>WED</span>
                <span>THU</span>
                <span>FRI</span>
                <span>SAT</span>
                <span>SUN</span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-emerald-700 p-4 text-white">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <Lightbulb size={21} />
              </div>
              <div>
                <p className="text-sm font-semibold">Make every unit count.</p>
                <p className="mt-1 text-xs text-emerald-100">
                  Small insights can lead to smarter energy choices.
                </p>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-5 -right-3 hidden rounded-2xl border border-white bg-white px-4 py-3 shadow-xl sm:block">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Leaf size={16} />
              </span>
              <div>
                <p className="text-xs font-bold text-stone-800">
                  Energy awareness
                </p>
                <p className="text-[10px] text-stone-400">
                  Starts with one dashboard
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
