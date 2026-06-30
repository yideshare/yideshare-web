import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

/**
 * Merges Tailwind CSS classes, resolving conflicts via tailwind-merge.
 *
 * @param inputs - Class values to merge, accepts any clsx-compatible input
 * @returns A single merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extracts initials from a full name using the first and last word.
 *
 * @param name - Full name to extract initials from
 * @returns Up to two uppercase initials, or "?" if the name is empty
 */
export function getInitials(name: string): string {
  const parts = name.split(" ");
  let initials = "";

  if (parts.length > 0) {
    initials += parts[0][0].toUpperCase();
  }

  if (parts.length > 1) {
    initials += parts[parts.length - 1][0].toUpperCase();
  }

  return initials || "?";
}
