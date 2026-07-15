import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { CampaignCard } from "./CampaignCard";

const campaign = {
  id: "campaign-1",
  title: "Solar water pump for a rural community",
  story: "A complete story",
  description: "Help a community install a reliable solar-powered water pump.",
  category: "Community",
  goalCredits: 1000,
  minimumContribution: 10,
  raisedCredits: 250,
  deadline: new Date(Date.now() + 7 * 86400000).toISOString(),
  rewardInfo: "Project updates",
  coverImageUrl: "https://example.com/cover.jpg",
  gallery: [],
  location: "Dhaka",
  status: "approved",
  creatorName: "Creator User",
  creatorEmail: "creator@example.com"
};

describe("CampaignCard", () => {
  it("renders the required campaign information and details link", () => {
    render(
      <MemoryRouter>
        <CampaignCard campaign={campaign} />
      </MemoryRouter>
    );

    expect(screen.getByText(campaign.title)).toBeInTheDocument();
    expect(screen.getByText("Creator User")).toBeInTheDocument();
    expect(screen.getByText("250")).toBeInTheDocument();
    expect(screen.getByText("1,000")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view details/i })).toHaveAttribute(
      "href",
      "/campaigns/campaign-1"
    );
  });
});
