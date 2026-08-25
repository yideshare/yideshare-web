"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn, isActiveRoute } from "@/lib/frontend";

import { navItems } from "./navItems";

export function TopNavButtons() {
  const pathname = usePathname();
  return (
    <div className="flex items-center gap-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = isActiveRoute(pathname, item.url);
        if (item.isButton) {
          return (
            <Button
              key={item.title}
              variant="ghost"
              size="sm"
              onClick={() => (window.location.href = item.url)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.title}</span>
            </Button>
          );
        }
        return (
          <Link
            key={item.title}
            href={item.url}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
              isActive
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent hover:text-accent-foreground"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{item.title}</span>
          </Link>
        );
      })}
    </div>
  );
}
