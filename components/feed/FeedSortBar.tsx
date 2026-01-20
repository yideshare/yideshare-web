import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import React from "react";

export function FeedSortBar({
  sortBy,
  setSortBy,
}: {
  sortBy: string;
  setSortBy: (v: string) => void;
}) {
  return (
    <div className="absolute top-9 right-6 flex items-center text-sm text-black gap-1">
      <span>Sort by:</span>
      <Select value={sortBy} onValueChange={setSortBy}>
        <SelectTrigger className="h-8 w-[150px] rounded-lg bg-white text-black">
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recent">Upcoming</SelectItem>
          <SelectItem value="oldest">Oldest</SelectItem>
          <SelectItem value="alphabetical">Alphabetical</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}