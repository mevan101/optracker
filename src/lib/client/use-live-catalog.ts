"use client";

import { useEffect, useState } from "react";
import {
  fetchJobs,
  fetchPlatforms,
  type JobsResponse,
  type PlatformRow,
} from "@/lib/client/api";
import { onCatalogChanged } from "@/lib/client/catalog-sync";
import type { JobListing } from "@/lib/domain/types";

export function useLiveJobs(initial: JobsResponse): JobsResponse {
  const [data, setData] = useState(initial);

  useEffect(() => {
    setData(initial);
  }, [initial]);

  useEffect(() => {
    let active = true;

    async function pull() {
      try {
        const next = await fetchJobs();
        if (active) {
          setData(next);
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
      active = false;
      stop();
    };
  }, []);

  return data;
}

export function useLiveListings(initial: JobListing[]): JobListing[] {
  const [listings, setListings] = useState(initial);

  useEffect(() => {
    setListings(initial);
  }, [initial]);

  useEffect(() => {
    let active = true;

    async function pull() {
      try {
        const next = await fetchJobs();
        if (active) {
          setListings(next.listings);
        }
      } catch {
        // Keep the last good list painted.
      }
    }

    void pull();
    const stop = onCatalogChanged(() => {
      void pull();
    });
    return () => {
      active = false;
      stop();
    };
  }, []);

  return listings;
}

export function useLivePlatforms(initial: PlatformRow[]): PlatformRow[] {
  const [platforms, setPlatforms] = useState(initial);

  useEffect(() => {
    setPlatforms(initial);
  }, [initial]);

  useEffect(() => {
    let active = true;

    async function pull() {
      try {
        const next = await fetchPlatforms();
        if (active) {
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
      active = false;
      stop();
    };
  }, []);

  return platforms;
}
