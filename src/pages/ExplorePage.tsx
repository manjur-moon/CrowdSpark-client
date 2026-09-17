import { useQuery } from "@tanstack/react-query";
import { FilterX, Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { CampaignCard } from "../components/CampaignCard";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { api } from "../lib/api";

import type { Campaign, PaginationMeta } from "../types";

const goalRanges = [
  {
    value: "",
    label: "Any funding goal",
    minGoal: undefined,
    maxGoal: undefined
  },
  {
    value: "under-1000",
    label: "Under 1,000 credits",
    minGoal: 0,
    maxGoal: 999
  },
  {
    value: "1000-5000",
    label: "1,000–5,000 credits",
    minGoal: 1000,
    maxGoal: 5000
  },
  {
    value: "5001-10000",
    label: "5,001–10,000 credits",
    minGoal: 5001,
    maxGoal: 10000
  },
  {
    value: "10001-plus",
    label: "More than 10,000 credits",
    minGoal: 10001,
    maxGoal: undefined
  }
];

export default function ExplorePage() {
  const [params, setParams] = useSearchParams();

  const [searchValue, setSearchValue] = useState(params.get("search") ?? "");

  const debouncedSearch = useDebouncedValue(searchValue, 450);

  const page = Number(params.get("page") || 1);

  const goal = params.get("goal") ?? "";

  const goalRange = goalRanges.find((item) => item.value === goal) ?? goalRanges[0];

  useEffect(() => {
    setSearchValue(params.get("search") ?? "");
  }, [params]);

  useEffect(() => {
    const normalized = debouncedSearch.trim();

    if (normalized === (params.get("search") ?? "")) {
      return;
    }

    const next = new URLSearchParams(params);

    if (normalized) {
      next.set("search", normalized);
    } else {
      next.delete("search");
    }

    next.delete("page");

    setParams(next, {
      replace: true
    });
  }, [debouncedSearch, params, setParams]);

  const requestParams = useMemo(
    () => ({
      search: params.get("search") || undefined,
      category: params.get("category") || undefined,
      sort: params.get("sort") || "newest",
      deadline: params.get("deadline") || undefined,
      minGoal: goalRange.minGoal,
      maxGoal: goalRange.maxGoal,
      page,
      limit: 12
    }),
    [goalRange.maxGoal, goalRange.minGoal, page, params]
  );

  const campaigns = useQuery({
    queryKey: ["campaigns", requestParams],

    queryFn: async () =>
      (
        await api.get<{
          data: Campaign[];
          meta: PaginationMeta;
        }>("/campaigns", {
          params: requestParams
        })
      ).data,

    placeholderData: (previous) => previous
  });

  const categories = useQuery({
    queryKey: ["categories"],

    queryFn: async () =>
      (
        await api.get<{
          data: string[];
        }>("/campaigns/categories")
      ).data.data,

    staleTime: 5 * 60 * 1000
  });

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);

    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }

    if (key !== "page") {
      next.delete("page");
    }

    setParams(next);
  };

  const resetFilters = () => {
    setSearchValue("");
    setParams(new URLSearchParams());
  };

  const hasFilters = ["search", "category", "goal", "deadline", "sort", "page"].some((key) =>
    params.has(key)
  );

  return (
    <main className="campaign-page min-h-screen py-14 sm:py-16">
      <div className="container-app">
        {/* Page intro */}
        <div className="max-w-4xl">
          <p className="editorial-label">Explore CrowdSpark</p>

          <h1
            className="
              display-heading
              mt-4
              max-w-4xl
              text-[clamp(3rem,5vw,5.5rem)]
              leading-[0.94]
              text-[var(--editorial-text)]
            "
          >
            Find a campaign worth supporting
          </h1>

          <p
            className="
              mt-6
              max-w-3xl
              text-base
              leading-8
              text-[var(--editorial-text-soft)]
            "
          >
            Search by campaign title or Creator, then refine results by category, funding goal and
            deadline.
          </p>
        </div>

        {/* Search and filters */}
        <section
          className="
            campaign-surface
            mt-10
            p-5
            sm:p-6
            lg:p-7
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
              text-sm
              font-semibold
              text-[var(--editorial-text)]
            "
          >
            <SlidersHorizontal className="size-4" />
            Search and filters
          </div>

          <div
            className="
              mt-5
              grid
              gap-4
              md:grid-cols-2
              xl:grid-cols-6
            "
          >
            {/* Search */}
            <label className="relative md:col-span-2">
              <span className="sr-only">Search campaign title or Creator</span>

              <Search
                className="
                  pointer-events-none
                  absolute
                  left-4
                  top-1/2
                  size-5
                  -translate-y-1/2
                  text-[var(--editorial-muted)]
                "
              />

              <input
                className="campaign-field pl-12"
                type="search"
                placeholder="Search title or Creator name"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
              />
            </label>

            {/* Category */}
            <select
              aria-label="Filter by category"
              className="campaign-field"
              value={params.get("category") || ""}
              onChange={(event) => update("category", event.target.value)}
            >
              <option value="">All categories</option>

              {categories.data?.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {/* Goal */}
            <select
              aria-label="Filter by funding goal"
              className="campaign-field"
              value={goal}
              onChange={(event) => update("goal", event.target.value)}
            >
              {goalRanges.map((range) => (
                <option key={range.value || "all"} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>

            {/* Deadline */}
            <select
              aria-label="Filter by deadline"
              className="campaign-field"
              value={params.get("deadline") || ""}
              onChange={(event) => update("deadline", event.target.value)}
            >
              <option value="">Any deadline</option>

              <option value="7d">Ending within 7 days</option>

              <option value="30d">Ending within 30 days</option>

              <option value="60d">Ending within 60 days</option>

              <option value="90d">Ending within 90 days</option>
            </select>

            {/* Sort */}
            <select
              aria-label="Sort campaigns"
              className="campaign-field"
              value={params.get("sort") || "newest"}
              onChange={(event) => update("sort", event.target.value)}
            >
              <option value="newest">Newest</option>

              <option value="oldest">Oldest</option>

              <option value="most_funded">Most funded</option>

              <option value="ending_soon">Nearest deadline</option>

              <option value="goal_low">Funding goal: low to high</option>

              <option value="goal_high">Funding goal: high to low</option>
            </select>
          </div>

          {/* Filter status */}
          <div
            className="
              mt-5
              flex
              flex-wrap
              items-center
              justify-between
              gap-4
              border-t
              border-[var(--editorial-border)]
              pt-5
            "
          >
            <p
              className="
                text-sm
                text-[var(--editorial-muted)]
              "
            >
              {campaigns.data
                ? `${campaigns.data.meta.total.toLocaleString()} campaign${
                    campaigns.data.meta.total === 1 ? "" : "s"
                  } found`
                : "Loading campaigns..."}
            </p>

            <button
              type="button"
              disabled={!hasFilters}
              onClick={resetFilters}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-full
                border
                border-[var(--editorial-border)]
                bg-transparent
                px-5
                py-2.5
                text-sm
                font-semibold
                text-[var(--editorial-text-soft)]
                transition
                hover:bg-black/5
                hover:text-[var(--editorial-text)]
                disabled:cursor-not-allowed
                disabled:opacity-40
                dark:hover:bg-white/5
              "
            >
              <FilterX className="size-4" />
              Reset filters
            </button>
          </div>
        </section>

        {/* Loading */}
        {campaigns.isLoading ? (
          <div
            className="
              mt-10
              grid
              gap-6
              sm:grid-cols-2
              lg:grid-cols-3
              2xl:grid-cols-4
            "
          >
            {Array.from({
              length: 8
            }).map((_, index) => (
              <div
                key={index}
                className="
                  h-[500px]
                  animate-pulse
                  rounded-[24px]
                  border
                  border-[var(--editorial-border)]
                  bg-[var(--editorial-card)]
                "
              />
            ))}
          </div>
        ) : campaigns.isError ? (
          /* Error */
          <section
            className="
              campaign-surface
              mt-10
              px-6
              py-16
              text-center
              sm:px-10
            "
          >
            <p className="editorial-label">Unable to load</p>

            <h2
              className="
                display-heading
                mt-4
                text-4xl
                leading-none
                text-[var(--editorial-text)]
                sm:text-5xl
              "
            >
              Campaigns could not be loaded
            </h2>

            <p
              className="
                mx-auto
                mt-5
                max-w-xl
                text-sm
                leading-7
                text-[var(--editorial-text-soft)]
              "
            >
              Check the API connection and try again.
            </p>

            <button
              type="button"
              className="editorial-button mt-7"
              onClick={() => void campaigns.refetch()}
            >
              Try again
              <ArrowRightIcon />
            </button>
          </section>
        ) : campaigns.data?.data.length ? (
          <>
            {/* Campaign grid */}
            <div
              className={`
                mt-10
                grid
                gap-6
                sm:grid-cols-2
                lg:grid-cols-3
                2xl:grid-cols-4
                transition-opacity
                duration-300
                ${campaigns.isPlaceholderData ? "opacity-60" : "opacity-100"}
              `}
            >
              {campaigns.data.data.map((campaign) => (
                <CampaignCard key={campaign.id || campaign._id} campaign={campaign} />
              ))}
            </div>

            {/* Pagination */}
            <div
              className="
                mt-10
                flex
                flex-col
                gap-4
                border-t
                border-[var(--editorial-border)]
                pt-6
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <span
                className="
                  text-sm
                  text-[var(--editorial-muted)]
                "
              >
                Page {campaigns.data.meta.page} of {Math.max(1, campaigns.data.meta.totalPages)}
              </span>

              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={!campaigns.data.meta.hasPreviousPage || campaigns.isFetching}
                  onClick={() => update("page", String(page - 1))}
                  className="
                    inline-flex
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-[var(--editorial-border)]
                    bg-transparent
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-[var(--editorial-text)]
                    transition
                    hover:bg-black/5
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                    dark:hover:bg-white/5
                  "
                >
                  Previous
                </button>

                <button
                  type="button"
                  disabled={!campaigns.data.meta.hasNextPage || campaigns.isFetching}
                  onClick={() => update("page", String(page + 1))}
                  className="
                    editorial-button
                    px-6
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Empty state */
          <section
            className="
              campaign-surface
              mt-10
              px-6
              py-16
              text-center
              sm:px-10
            "
          >
            <p className="editorial-label">No results</p>

            <h2
              className="
                display-heading
                mt-4
                text-4xl
                leading-none
                text-[var(--editorial-text)]
                sm:text-5xl
              "
            >
              No campaigns found
            </h2>

            <p
              className="
                mx-auto
                mt-5
                max-w-xl
                text-sm
                leading-7
                text-[var(--editorial-text-soft)]
              "
            >
              Try removing a filter or searching with a different campaign title or Creator name.
            </p>

            <button type="button" className="editorial-button mt-7" onClick={resetFilters}>
              Show all campaigns
            </button>
          </section>
        )}
      </div>
    </main>
  );
}

/**
 * Small local arrow keeps the button markup lightweight
 * without adding another top-level dependency.
 */
function ArrowRightIcon() {
  return (
    <span aria-hidden="true" className="text-base leading-none">
      →
    </span>
  );
}
