"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconBookmark, IconCompass, IconRadio, IconRows } from "@/components/icons";

const NAV = [
  { href: "/", label: "Discover", icon: IconCompass },
  { href: "/platforms", label: "Boards", icon: IconRows },
  { href: "/pulse", label: "Pulse", icon: IconRadio },
  { href: "/saved", label: "Saved", icon: IconBookmark },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function SideNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-10 space-y-1">
      {NAV.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch
            data-active={active}
            className={`nav-item flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[15px] ${
              active ? "glass-strong text-ivory" : "text-mist hover:text-ivory"
            }`}
          >
            <item.icon size={16} />
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
    <nav className="bottom-safe glass fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-[430px] px-4 pt-2 lg:hidden">
      <div className="grid grid-cols-4">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              data-active={active}
              className={`nav-item flex min-h-12 flex-col items-center justify-center gap-0.5 text-[10px] ${
                active ? "text-ivory" : "text-ash"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
