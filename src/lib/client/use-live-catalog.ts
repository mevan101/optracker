"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchJobs,
  fetchPlatforms,
  type JobsResponse,
  type PlatformRow,
} from "@/lib/client/api";
import {
  onCatalogChanged,
  preferFresherCatalog,
  readJobsSnapshot,
  saveJobsSnapshot,
} from "@/lib/client/catalog-sync";
import { MAX_CRAWLS_PER_DAY } from "@/lib/domain/types";
import type { JobListing } from "@/lib/domain/types";

export function useLiveJobs(initial: JobsResponse): JobsResponse {
  const [data, setData] = useState(initial);

  useEffect(() => {
    setData((current) => preferFresherCatalog(current, initial));
  }, [initial]);

  useEffect(() => {
    const state = { active: true };

    async function pull() {
      const snapshot = readJobsSnapshot();
      if (snapshot && state.active) {
        setData((current) => preferFresherCatalog(current, snapshot));
      }
      try {
        const next = await fetchJobs();
        if (state.active) {
          setData((current) => {
            const picked = preferFresherCatalog(current, next);
            if (picked === next) {
              saveJobsSnapshot(next);
            }
            return picked;
          });
        }
      } catch {
        // Keep the last good catalog painted.
      }
    }

    void pull();
    const stop = onCatalogChanged(() => {
      void pull();
    });
    return () => {
      state.active = false;
      stop();
    };
  }, []);

  return data;
}

export function useLiveListings(initial: JobListing[]): JobListing[] {
  const seed = useMemo((): JobsResponse => {
    return {
      listings: initial,
      total: initial.length,
      hidden: 0,
      updatedAt: null,
      budget: {
        date: "",
        used: 0,
        limit: MAX_CRAWLS_PER_DAY,
        remaining: MAX_CRAWLS_PER_DAY,
        log: [],
      },
    };
  }, [initial]);
  return useLiveJobs(seed).listings;
}

export function useLivePlatforms(initial: PlatformRow[]): PlatformRow[] {
  const [platforms, setPlatforms] = useState(initial);

  useEffect(() => {
    const state = { active: true };

    async function pull() {
      try {
        const next = await fetchPlatforms();
        if (state.active) {
          setPlatforms(next.platforms);
        }
      } catch {
        // Keep the last good board list painted.
      }
    }

    void pull();
    const stop = onCatalogChanged(() => {
      void pull();
    });
    return () => {
      state.active = false;
      stop();
    };
  }, []);

  return platforms;
}
