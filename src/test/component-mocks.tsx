import { vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    prefetch?: boolean;
  }) => {
    delete rest.prefetch;
    return (
    <a href={href} {...rest}>
      {children}
    </a>
    );
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/",
}));
