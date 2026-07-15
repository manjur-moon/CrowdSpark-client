import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import type { Contribution, PaginationMeta } from "../types";

export default function SupporterContributionsPage() {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get("page") || 1);
  const status = params.get("status") || "";
  const query = useQuery({
    queryKey: ["supporter-contributions", page, status],
    queryFn: async () =>
      (
        await api.get<{ data: Contribution[]; meta: PaginationMeta }>("/contributions/mine", {
          params: { page, limit: 10, status: status || undefined }
        })
      ).data
  });
  const update = (k: string, v: string) => {
    const n = new URLSearchParams(params);
    if (v) {
      n.set(k, v);
    } else {
      n.delete(k);
    }
    if (k !== "page") n.delete("page");
    setParams(n);
  };
  return (
    <main className="space-y-6">
      <header>
        <p className="font-bold text-emerald-700">SUPPORTER</p>
        <h1 className="mt-2 text-3xl font-black">My contributions</h1>
      </header>
      <div className="card p-5">
        <select
          className="field max-w-xs"
          value={status}
          onChange={(e) => update("status", e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="refund_requested">Refund requested</option>
        </select>
      </div>
      {query.isLoading ? (
        <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
      ) : query.data?.data.length ? (
        <>
          <div className="card overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="p-4">Campaign</th>
                  <th className="p-4">Credits</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {query.data.data.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="p-4 font-bold">{c.campaignTitle}</td>
                    <td className="p-4">{c.credits}</td>
                    <td className="p-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize">
                        {c.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-500">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <Link
                        className="font-bold text-emerald-700"
                        to={`/campaigns/${c.campaignId}`}
                      >
                        Campaign
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-slate-500">
              Page {query.data.meta.page} of {query.data.meta.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                className="btn-secondary"
                disabled={!query.data.meta.hasPreviousPage}
                onClick={() => update("page", String(page - 1))}
              >
                Previous
              </button>
              <button
                className="btn-secondary"
                disabled={!query.data.meta.hasNextPage}
                onClick={() => update("page", String(page + 1))}
              >
                Next
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="card p-10 text-center">
          No contributions found.{" "}
          <Link to="/campaigns" className="font-bold text-emerald-700">
            Explore campaigns
          </Link>
        </div>
      )}
    </main>
  );
}
