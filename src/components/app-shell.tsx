import { BottomNav, SideNav } from "@/components/nav-links";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col lg:max-w-[980px] lg:flex-row lg:gap-16 lg:px-10">
      <aside className="hidden w-[200px] shrink-0 flex-col justify-between py-14 lg:flex">
        <div>
          <p className="text-[15px] font-medium tracking-[-0.03em] text-ivory">Op</p>
          <SideNav />
        </div>
        <p className="text-[12px] leading-5 text-ash">
          Five pulses a day. Nothing invented.
        </p>
      </aside>

      <div className="relative min-h-dvh flex-1">
        <main id="board" className="page-enter app-safe px-[22px] lg:px-0 lg:pt-14">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
