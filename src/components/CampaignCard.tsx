import { ArrowRight, Clock3, Target, UserRound } from "lucide-react";
import { Link } from "react-router-dom";

import type { Campaign } from "../types";

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const goal = campaign.fundingGoalCredits ?? campaign.goalCredits;

  const progress = Math.min(
    100,
    Math.round((campaign.raisedCredits / Math.max(1, goal)) * 100)
  );

  const days = Math.max(
    0,
    Math.ceil(
      (new Date(campaign.deadline).getTime() - Date.now()) / 86400000
    )
  );

  return (
    <article
      className="
        campaign-surface
        group
        flex
        h-full
        flex-col
        overflow-hidden
        transition-all
        duration-500
        hover:-translate-y-2
        hover:shadow-2xl
      "
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={campaign.coverImageUrl}
          alt={campaign.title}
          className="
            size-full
            object-cover
            transition
            duration-700
            group-hover:scale-105
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-t
            from-black/30
            via-transparent
            to-transparent
          "
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        {/* Meta */}
        <div className="flex items-center justify-between gap-3">
          <span className="editorial-label">{campaign.category}</span>

          <span className="flex items-center gap-1.5 text-xs text-muted-app">
            <Clock3 className="size-3.5" />
            {days} days left
          </span>
        </div>

        {/* Title */}
        <h3
          className="
            editorial-title
            mt-5
            line-clamp-2
            text-4xl
            leading-none
          "
        >
          {campaign.title}
        </h3>

        {/* Description */}
        <p
          className="
            mt-4
            line-clamp-2
            min-h-14
            text-sm
            leading-7
            text-secondary-app
          "
        >
          {campaign.description}
        </p>

        {/* Creator */}
        <p
          className="
            mt-5
            flex
            items-center
            gap-2
            text-sm
            text-muted-app
          "
        >
          <UserRound className="size-4" />
          {campaign.creatorName}
        </p>

        {/* Progress */}
        <div
          className="
            mt-6
            h-2
            overflow-hidden
            rounded-full
            bg-[#cbd4d7]
            dark:bg-[#26332e]
          "
        >
          <div
            className="
              h-full
              rounded-full
              bg-[#20352d]
              transition-all
              duration-500
              dark:bg-[#d6e3dd]
            "
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Stats */}
        <div className="mt-5 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xl font-semibold text-[var(--editorial-text)]">
              {campaign.raisedCredits.toLocaleString()}
            </p>

            <p className="mt-1 text-xs text-muted-app">credits raised</p>
          </div>

          <div className="text-right">
            <p
              className="
                flex
                items-center
                justify-end
                gap-1.5
                text-xl
                font-semibold
                text-[var(--editorial-text)]
              "
            >
              <Target className="size-4" />
              {goal.toLocaleString()}
            </p>

            <p className="mt-1 text-xs text-muted-app">funding goal</p>
          </div>
        </div>

        {/* CTA */}
        <Link
          to={`/campaigns/${campaign.id || campaign._id}`}
          className="
            editorial-button
            mt-auto
            pt-0
            w-full
          "
          style={{ marginTop: "28px" }}
        >
          View details
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </article>
  );
}