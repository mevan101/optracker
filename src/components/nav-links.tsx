"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconBookmark, IconCompass, IconRadio, IconRows } from "@/components/icons";
import { isActivePath } from "@/lib/nav/active-path";

const NAV = [
  { href: "/", label: "Roles", icon: IconCompass },
  { href: "/platforms", label: "Boards", icon: IconRows },
  { href: "/pulse", label: "Pulse", icon: IconRadio },
  { href: "/saved", label: "Saved", icon: IconBookmark },
] as const;

export function SideNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-14 space-y-5" aria-label="Primary">
      {NAV.map((item) => {
        const active = isActivePath(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch
            data-active={active}
            aria-current={active ? "page" : undefined}
            className={`nav-item block text-[16px] tracking-[-0.02em] ${
              active ? "text-ivory" : "text-ash"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="bottom-safe glass hairline-t fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-[402px] px-1 pt-2 lg:hidden"
      aria-label="Primary"
    >
      <div className="grid grid-cols-4">
        {NAV.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              data-active={active}
              aria-current={active ? "page" : undefined}
              className="nav-item flex min-h-12 flex-col items-center justify-center gap-1 text-[11px] tracking-[-0.01em] text-ivory"
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
