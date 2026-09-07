import { describe, expect, it } from "vitest";
import {
  normalizeArbeitnow,
  normalizeJobicy,
  normalizeRemoteOk,
  normalizeRemotive,
  unwrapSourceRows,
} from "./normalize";

describe("source normalizers", () => {
  it("skips Remote OK legal preamble objects", () => {
    expect(normalizeRemoteOk({ legal: "terms" })).toBeNull();
    expect(unwrapSourceRows([{ legal: "terms" }, { position: "x" }], "remoteok")).toHaveLength(
      2,
    );
  });

  it("maps Remote OK fields", () => {
    const listing = normalizeRemoteOk({
      id: "1137302",
      position: "Customer Support & Success Specialist",
      company: "Warehance",
      location: "",
      url: "https://remoteOK.com/remote-jobs/remote-customer-support-success-specialist-warehance-1137302",
      date: "2026-09-03T19:12:26+00:00",
      tags: ["customer support"],
      salary_min: 50000,
      salary_max: 70000,
      description: "Help customers succeed.",
    });
    expect(listing?.platformId).toBe("remoteok");
    expect(listing?.company).toBe("Warehance");
    expect(listing?.workMode).toBe("remote");
    expect(listing?.salary).toBe("$50k–$70k");
  });

  it("maps Remotive, Arbeitnow, and Jobicy fields", () => {
    expect(
      normalizeRemotive({
        id: 1749306,
        url: "https://remotive.com/remote-jobs/writing/freelance-copywriter-1749306",
        title: "Freelance Copywriter",
        company_name: "Coalition Technologies",
        publication_date: "2026-09-02T19:59:53",
        candidate_required_location: "Worldwide",
        tags: ["Writing"],
        description: "Write copy.",
      })?.platformId,
    ).toBe("remotive");

    expect(
      normalizeArbeitnow({
        slug: "strategic-client-director-berlin-337165",
        company_name: "The Global Talent Co.",
        title: "Strategic Client Director",
        remote: false,
        url: "https://www.arbeitnow.com/jobs/companies/the-global-talent-co/x",
        tags: ["Business"],
        job_types: ["Full Time"],
        location: "Germany",
        created_at: 1788608414,
        description: "Lead clients.",
      })?.location,
    ).toBe("Germany");

    expect(
      normalizeJobicy({
        id: 152566,
        url: "https://jobicy.com/jobs/152566-support-engineer",
        jobTitle: "Support Engineer",
        companyName: "Roboflow",
        jobGeo: "USA",
        jobIndustry: ["Technical Support"],
        pubDate: "2026-09-05T06:08:42+00:00",
        jobExcerpt: "Make the world programmable.",
      })?.company,
    ).toBe("Roboflow");
  });
});
