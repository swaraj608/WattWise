
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Plug,
  Settings,
  Zap,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Appliances", href: "/appliances", icon: Plug },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [width, setWidth] = useState(256);

  function handleResize(e: React.PointerEvent<HTMLDivElement>) {
    if (e.buttons !== 1) return;

    setWidth(Math.min(360, Math.max(200, e.clientX)));
  }

  return (
    <aside
      style={{ width: `${width}px` }}
      className="relative flex min-h-screen shrink-0 flex-col border-r border-stone-200 bg-white px-5 py-7"
    >
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
              className={`flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-3 text-sm font-medium transition ${
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
        <div className="flex items-center gap-2 whitespace-nowrap text-sm font-semibold text-emerald-950">
          <Zap size={16} />
          Energy insights
        </div>

        <p className="mt-2 text-xs leading-5 text-emerald-900/70">
          Track usage and make smarter electricity decisions.
        </p>
      </div>

      {/* Drag handle */}
      <div
        role="separator"
        aria-label="Resize sidebar"
        aria-orientation="vertical"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          handleResize(e);
        }}
        onPointerMove={handleResize}
        className="absolute right-0 top-0 z-20 h-full w-1.5 cursor-col-resize touch-none transition-colors hover:bg-emerald-500/40 active:bg-emerald-600/50"
        title="Drag to resize sidebar"
      />
    </aside>
  );
}
