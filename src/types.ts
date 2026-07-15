export type Role = "supporter" | "creator" | "admin";

export interface Profile {
  id: string;
  authUserId: string;
  name: string;
  email: string;
  image: string | null;
  role: Role;
  status: "active" | "suspended" | "banned";
  credits: number;
  creatorBalance: number;
  reservedCreatorCredits: number;
  onboardingCompleted: boolean;
}

export interface CurrentUserResponse {
  user: { id: string; name: string; email: string; image?: string | null };
  profile: Profile | null;
  onboardingCompleted: boolean;
}

export interface Campaign {
  id: string;
  _id?: string;
  title: string;
  story: string;
  description: string;
  category: string;
  goalCredits: number;
  fundingGoalCredits?: number;
  minimumContribution: number;
  raisedCredits: number;
  deadline: string;
  rewardInfo: string;
  coverImageUrl: string;
  gallery: string[];
  location: string;
  status: string;
  creatorId?: string;
  creatorName: string;
  creatorEmail: string;
  supporterCount?: number;
  creator?: { id: string; name: string; email: string };
  rejectionReason?: string | null;
  moderationReason?: string | null;
  suspendedAt?: string | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface Contribution {
  id: string;
  campaignId: string;
  campaignTitle: string;
  credits: number;
  message: string | null;
  status: string;
  supporterName: string;
  supporterEmail: string;
  creatorName: string;
  reviewNote?: string | null;
  createdAt: string;
  campaign?: { id: string; title: string; coverImageUrl: string | null };
  supporter?: { id: string; name: string; email: string; photoUrl: string | null };
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl: string | null;
  isRead: boolean;
  createdAt: string;
}
