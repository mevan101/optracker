/** @vitest-environment happy-dom */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageHeader } from "./page-header";

describe("PageHeader", () => {
  it("renders the title and optional meta", () => {
    render(<PageHeader title="Roles" meta={50} />);
    expect(screen.getByRole("heading", { name: "Roles" })).toBeTruthy();
    expect(screen.getByText("50")).toBeTruthy();
  });
});
