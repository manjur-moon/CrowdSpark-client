import { ArrowRight, Clock3, Target, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import type { Campaign } from "../types";

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const goal = campaign.fundingGoalCredits ?? campaign.goalCredits;
  const progress = Math.min(100, Math.round((campaign.raisedCredits / Math.max(1, goal)) * 100));
  const days = Math.max(
    0,
    Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / 86400000)
  );

  return (
    <article className="card flex h-full flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-lg">
      <div className="aspect-[16/10] overflow-hidden bg-slate-100">
        <img src={campaign.coverImageUrl} alt={campaign.title} className="size-full object-cover" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
            {campaign.category}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <Clock3 className="size-3.5" />
            {days} days left
          </span>
        </div>

        <h3 className="mt-3 line-clamp-2 min-h-14 text-lg font-bold text-slate-950">
          {campaign.title}
        </h3>
        <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-slate-600">
          {campaign.description}
        </p>
        <p className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-500">
          <UserRound className="size-4" />
          {campaign.creatorName}
        </p>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full bg-emerald-600" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="font-bold text-slate-950">{campaign.raisedCredits.toLocaleString()}</p>
            <p className="text-xs text-slate-500">credits raised</p>
          </div>
          <div className="text-right">
            <p className="flex items-center justify-end gap-1 font-bold text-slate-950">
              <Target className="size-4" />
              {goal.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500">funding goal</p>
          </div>
        </div>

        <Link to={`/campaigns/${campaign.id || campaign._id}`} className="btn-primary mt-6 w-full">
          View Details <ArrowRight className="size-4" />
        </Link>
      </div>
    </article>
  );
}
