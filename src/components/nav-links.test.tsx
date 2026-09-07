/** @vitest-environment happy-dom */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BottomNav } from "./nav-links";

vi.mock("next/navigation", () => ({
  usePathname: () => "/pulse",
}));

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

describe("BottomNav", () => {
  it("marks Pulse current when that is the path", () => {
    render(<BottomNav />);
    expect(screen.getByRole("link", { name: "Pulse" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "Roles" }).getAttribute("aria-current")).toBeNull();
  });
});
