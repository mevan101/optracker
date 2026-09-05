"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Compass, Radio, Rows3 } from "lucide-react";

const NAV = [
  { href: "/", label: "Discover", icon: Compass },
  { href: "/platforms", label: "Boards", icon: Rows3 },
  { href: "/pulse", label: "Pulse", icon: Radio },
  { href: "/saved", label: "Saved", icon: Bookmark },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col lg:max-w-[1080px] lg:flex-row lg:gap-10 lg:px-8">
      <aside className="hidden w-[220px] shrink-0 flex-col justify-between py-10 lg:flex">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-mist">
            OpTracker
          </p>
          <h1 className="mt-3 text-[28px] font-semibold leading-none text-ivory">
            Quiet boards.
            <br />
            Living roles.
          </h1>
          <nav className="mt-10 space-y-1">
            {NAV.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[15px] transition ${
                    active
                      ? "glass-strong text-ivory"
                      : "text-mist hover:bg-white/[0.03] hover:text-ivory"
                  }`}
                >
                  <item.icon size={16} strokeWidth={1.5} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <p className="text-[12px] leading-5 text-ash">
          Five pulses a day. Expired, broken, mock, and placeholder listings never
          reach the board.
        </p>
      </aside>

      <div className="relative min-h-dvh flex-1 lg:my-6 lg:min-h-[calc(100dvh-3rem)] lg:overflow-hidden lg:rounded-[32px] lg:whisper">
        <div className="app-safe px-5 lg:px-8">{children}</div>
        <nav className="bottom-safe glass fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-[430px] px-4 pt-2 lg:hidden">
          <div className="grid grid-cols-4">
            {NAV.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex min-h-12 flex-col items-center justify-center gap-0.5 text-[10px] ${
                    active ? "text-ivory" : "text-ash"
                  }`}
                >
                  <item.icon size={18} strokeWidth={active ? 1.75 : 1.4} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
