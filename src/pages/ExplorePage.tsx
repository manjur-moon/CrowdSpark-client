import { useQuery } from "@tanstack/react-query";
import { FilterX, Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CampaignCard } from "../components/CampaignCard";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { api } from "../lib/api";
import type { Campaign, PaginationMeta } from "../types";

const goalRanges = [
  { value: "", label: "Any funding goal", minGoal: undefined, maxGoal: undefined },
  { value: "under-1000", label: "Under 1,000 credits", minGoal: 0, maxGoal: 999 },
  { value: "1000-5000", label: "1,000–5,000 credits", minGoal: 1000, maxGoal: 5000 },
  { value: "5001-10000", label: "5,001–10,000 credits", minGoal: 5001, maxGoal: 10000 },
  { value: "10001-plus", label: "More than 10,000 credits", minGoal: 10001, maxGoal: undefined }
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
    if (normalized === (params.get("search") ?? "")) return;
    const next = new URLSearchParams(params);
    if (normalized) next.set("search", normalized);
    else next.delete("search");
    next.delete("page");
    setParams(next, { replace: true });
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
        await api.get<{ data: Campaign[]; meta: PaginationMeta }>("/campaigns", {
          params: requestParams
        })
      ).data,
    placeholderData: (previous) => previous
  });

  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.get<{ data: string[] }>("/campaigns/categories")).data.data,
    staleTime: 5 * 60 * 1000
  });

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
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
    <main className="container-app py-12">
      <div className="max-w-3xl">
        <p className="font-bold text-emerald-700">Explore CrowdSpark</p>
        <h1 className="mt-2 text-4xl font-black">Find a campaign worth supporting</h1>
        <p className="mt-4 text-slate-600">
          Search by campaign title or Creator, then refine results by category, funding goal and
          deadline.
        </p>
      </div>

      <section className="card mt-8 p-5">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <SlidersHorizontal className="size-4" />
          Search and filters
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <label className="relative md:col-span-2">
            <span className="sr-only">Search campaign title or Creator</span>
            <Search className="pointer-events-none absolute left-3 top-3.5 size-5 text-slate-400" />
            <input
              className="field pl-11"
              type="search"
              placeholder="Search title or Creator name"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />
          </label>

          <select
            aria-label="Filter by category"
            className="field"
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

          <select
            aria-label="Filter by funding goal"
            className="field"
            value={goal}
            onChange={(event) => update("goal", event.target.value)}
          >
            {goalRanges.map((range) => (
              <option key={range.value || "all"} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by deadline"
            className="field"
            value={params.get("deadline") || ""}
            onChange={(event) => update("deadline", event.target.value)}
          >
            <option value="">Any deadline</option>
            <option value="7d">Ending within 7 days</option>
            <option value="30d">Ending within 30 days</option>
            <option value="60d">Ending within 60 days</option>
            <option value="90d">Ending within 90 days</option>
          </select>

          <select
            aria-label="Sort campaigns"
            className="field"
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

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            {campaigns.data
              ? `${campaigns.data.meta.total.toLocaleString()} campaign${campaigns.data.meta.total === 1 ? "" : "s"} found`
              : "Loading campaigns..."}
          </p>
          <button
            type="button"
            className="btn-secondary"
            disabled={!hasFilters}
            onClick={resetFilters}
          >
            <FilterX className="size-4" /> Reset filters
          </button>
        </div>
      </section>

      {campaigns.isLoading ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-[470px] animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      ) : campaigns.isError ? (
        <div className="card mt-8 p-10 text-center">
          <h2 className="text-xl font-bold text-red-700">Campaigns could not be loaded</h2>
          <p className="mt-2 text-sm text-slate-500">Check the API connection and try again.</p>
          <button className="btn-secondary mt-5" onClick={() => void campaigns.refetch()}>
            Try again
          </button>
        </div>
      ) : campaigns.data?.data.length ? (
        <>
          <div
            className={`mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 ${campaigns.isPlaceholderData ? "opacity-60" : ""}`}
          >
            {campaigns.data.data.map((campaign) => (
              <CampaignCard key={campaign.id || campaign._id} campaign={campaign} />
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <span className="text-sm text-slate-500">
              Page {campaigns.data.meta.page} of {Math.max(1, campaigns.data.meta.totalPages)}
            </span>
            <div className="flex gap-2">
              <button
                className="btn-secondary"
                disabled={!campaigns.data.meta.hasPreviousPage || campaigns.isFetching}
                onClick={() => update("page", String(page - 1))}
              >
                Previous
              </button>
              <button
                className="btn-secondary"
                disabled={!campaigns.data.meta.hasNextPage || campaigns.isFetching}
                onClick={() => update("page", String(page + 1))}
              >
                Next
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="card mt-8 p-12 text-center">
          <h2 className="text-xl font-bold">No campaigns found</h2>
          <p className="mt-2 text-slate-500">
            Try removing a filter or searching with a different title or Creator name.
          </p>
          <button className="btn-primary mt-5" onClick={resetFilters}>
            Show all campaigns
          </button>
        </div>
      )}
    </main>
  );
}
