import { BottomNav, SideNav } from "@/components/nav-links";

export function AppShell({ children }: { children: React.ReactNode }) {
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
          <SideNav />
        </div>
        <p className="text-[12px] leading-5 text-ash">
          Five pulses a day. Expired, broken, mock, and placeholder listings never
          reach the board.
        </p>
      </aside>

      <div className="relative min-h-dvh flex-1 lg:my-6 lg:min-h-[calc(100dvh-3rem)] lg:overflow-auto lg:rounded-[32px] lg:whisper">
        <div className="page-enter app-safe px-5 lg:px-8">{children}</div>
        <BottomNav />
      </div>
    </div>
  );
}
