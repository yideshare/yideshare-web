import type { Ride, User } from "@/prisma/generated/prisma/client";

export interface FeedPageClientProps {
  initialRides: Ride[];
  bookmarkedRideIds: string[];
}

export interface FeedRideCardProps {
  ride: Ride;
  isBookmarkedInitial: boolean;
  showDialog?: boolean;
}

export interface searchParamsType {
  from: string;
  to: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface YaliesData {
  first_name: string;
  last_name: string;
  email: string;
}

// Subset of User returned from cookie authentication; excludes binary/nullable fields
export type AuthUser = Pick<User, "netId" | "name" | "email">;

