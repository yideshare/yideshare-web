import { Ride } from "@/prisma/generated/prisma/client";
import { Prisma } from "@/prisma/generated/prisma/client";

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

export interface RideWhereClauseWithArrayAND {
  AND: Prisma.RideWhereInput[];
}

export interface YaliesData {
  first_name: string;
  last_name: string;
  email: string;
}
