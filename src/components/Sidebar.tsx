
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Plug,
  Settings,
  Zap,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Appliances",
    href: "/appliances",
    icon: Plug,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col border-r border-stone-200 bg-white px-5 py-7">
      <Link href="/" className="mb-10 flex items-center gap-2">
        <div className="rounded-xl bg-emerald-950 p-2 text-white">
          <Zap size={21} />
        </div>
        <span className="text-xl font-bold tracking-tight text-emerald-950">
          WATTWISE
        </span>
      </Link>

      <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
        Workspace
      </p>

      <nav className="space-y-2">
        {navigation.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                active
                  ? "bg-emerald-50 text-emerald-800"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              }`}
            >
              <Icon size={19} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-xl bg-[#f0f5ef] p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-950">
          <Zap size={16} />
          Energy insights
        </div>
        <p className="mt-2 text-xs leading-5 text-emerald-900/70">
          Track usage and make smarter electricity decisions.
        </p>
      </div>
    </aside>
  );
}
