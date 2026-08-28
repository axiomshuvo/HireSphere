"use client";

import { JOB_CATEGORIES, JOB_TYPES } from "@/lib/api/jobstruture";
import { Magnifier, Xmark } from "@gravity-ui/icons";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const CATEGORIES = JOB_CATEGORIES;
const TYPES = JOB_TYPES;

const SEARCH_DEBOUNCE_MS = 350;

function buildUrl(pathname, params) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (!value) continue;
    search.set(key, value);
  }
  const qs = search.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export default function JobsFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [type, setType] = useState(searchParams.get("type") ?? "");
  const [remote, setRemote] = useState(searchParams.get("remote") === "true");
  const [location, setLocation] = useState(searchParams.get("location") ?? "");

  const searchDebounceRef = useRef(null);
  const locationDebounceRef = useRef(null);

  // Sync local form state from the URL whenever searchParams changes
  // externally (Reset button on the empty-state card, browser back/forward,
  // pagination links). Without this, the form keeps stale values after
  // navigation and the next keystroke re-pushes the old filters.
  const urlSearch = searchParams.get("search") ?? "";
  const urlCategory = searchParams.get("category") ?? "";
  const urlType = searchParams.get("type") ?? "";
  const urlLocation = searchParams.get("location") ?? "";
  const urlRemote = searchParams.get("remote") === "true";
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (locationDebounceRef.current) clearTimeout(locationDebounceRef.current);
    /* eslint-disable react-hooks/set-state-in-effect */
    setSearch(urlSearch);
    setCategory(urlCategory);
    setType(urlType);
    setLocation(urlLocation);
    setRemote(urlRemote);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [urlSearch, urlCategory, urlType, urlLocation, urlRemote]);

  // Refs let us read the latest state inside the debounced effects
  // without re-creating the timeout on every keystroke. Updated inside an
  // effect so we don't trigger the 'update ref during render' lint rule.
  const stateRef = useRef({ search, category, type, location, remote });
  useEffect(() => {
    stateRef.current = { search, category, type, location, remote };
  });

  function pushFilters(overrides = {}) {
    const next = { ...stateRef.current, ...overrides };
    const params = {
      search: next.search,
      category: next.category,
      type: next.type,
      location: next.location,
      remote: next.remote ? "true" : "",
    };
    router.push(buildUrl(pathname, params));
  }

  // Debounce the search box so we don't push a new URL on every keystroke.
  const onSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      pushFilters({ search: value });
    }, SEARCH_DEBOUNCE_MS);
  };

  // Debounce the location input as well.
  const onLocationChange = (e) => {
    const value = e.target.value;
    setLocation(value);
    if (locationDebounceRef.current) clearTimeout(locationDebounceRef.current);
    locationDebounceRef.current = setTimeout(() => {
      pushFilters({ location: value });
    }, SEARCH_DEBOUNCE_MS);
  };

  const onCategoryChange = (e) => {
    const value = e.target.value;
    setCategory(value);
    pushFilters({ category: value });
  };

  const onTypeChange = (e) => {
    const value = e.target.value;
    setType(value);
    pushFilters({ type: value });
  };

  const onRemoteChange = (e) => {
    const value = e.target.checked;
    setRemote(value);
    pushFilters({ remote: value });
  };

  const clear = () => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (locationDebounceRef.current) clearTimeout(locationDebounceRef.current);
    setSearch("");
    setCategory("");
    setType("");
    setRemote(false);
    setLocation("");
    router.push(pathname);
  };

  const hasFilters = search || category || type || remote || location;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        if (locationDebounceRef.current)
          clearTimeout(locationDebounceRef.current);
        pushFilters();
      }}
      className="rounded-2xl border border-default bg-content1 p-4"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <label className="relative flex items-center">
          <Magnifier className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={onSearchChange}
            placeholder="Search title or description"
            className="w-full rounded-lg border border-white/10 bg-[#1b1c1e] py-2 pl-9 pr-3 text-sm text-white placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-none"
          />
        </label>

        <select
          value={category}
          onChange={onCategoryChange}
          className="w-full rounded-lg border border-white/10 bg-[#1b1c1e] px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={type}
          onChange={onTypeChange}
          className="w-full rounded-lg border border-white/10 bg-[#1b1c1e] px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
        >
          <option value="">All types</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={location}
          onChange={onLocationChange}
          placeholder="City or country"
          className="w-full rounded-lg border border-white/10 bg-[#1b1c1e] px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-none"
        />

        <label className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-[#1b1c1e] px-3 py-2 text-sm text-white">
          <input
            type="checkbox"
            checked={remote}
            onChange={onRemoteChange}
            className="size-4 accent-indigo-500"
          />
          <span>Remote</span>
        </label>
      </div>

      {hasFilters && (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={clear}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-white"
          >
            <Xmark className="size-3" />
            Clear filters
          </button>
        </div>
      )}
    </form>
  );
}
