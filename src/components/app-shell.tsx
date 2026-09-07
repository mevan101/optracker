import { BottomNav, SideNav } from "@/components/nav-links";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col lg:max-w-[980px] lg:flex-row lg:gap-20 lg:px-10">
      <aside className="hidden w-[220px] shrink-0 flex-col justify-between py-16 lg:flex">
        <div>
          <p className="font-display text-[26px] font-normal leading-none tracking-[-0.03em] text-ivory">
            OpTracker
          </p>
          <SideNav />
        </div>
        <p className="text-[12px] leading-5 text-ash">5 pulses each UTC day</p>
      </aside>

      <div className="relative min-h-dvh flex-1">
        <main id="board" className="page-enter app-safe px-[22px] lg:px-0 lg:pt-16">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
