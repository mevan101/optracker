/** @vitest-environment happy-dom */

import "@/test/component-mocks";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { sampleListings } from "@/lib/client/test-fixtures";
import { JobCard } from "./job-card";

describe("JobCard", () => {
  it("links a listing with company, board, and work mode", () => {
    render(<JobCard listing={sampleListings[0]!} />);
    const link = screen.getByRole("link", { name: "Support Engineer at Roboflow" });
    expect(link.getAttribute("href")).toBe("/jobs/jobicy%3A1");
    expect(screen.getByText("Roboflow")).toBeTruthy();
    expect(screen.getByText("Remote")).toBeTruthy();
    expect(screen.getByText(/Jobicy/)).toBeTruthy();
  });
});
