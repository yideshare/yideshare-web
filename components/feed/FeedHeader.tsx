import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import { TopNavButtons } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet";
import { Calendar, User, Bookmark, PowerOffIcon, Menu } from "lucide-react";
import { cn } from "@/lib/frontend";

export function FeedHeader({ feedbackUrl }: { feedbackUrl: string }) {
  const pathname = usePathname();
  const navItems = [
    { title: "Feed", url: "/feed", icon: Calendar },
    { title: "My Posts", url: "/your-rides", icon: User },
    { title: "Saved Rides", url: "/bookmarks", icon: Bookmark },
    {
      title: "Logout",
      url: "/api/auth/logout",
      icon: PowerOffIcon,
      isButton: true,
    },
  ];
  return (
    <header className="bg-background py-4 sm:py-6 lg:py-8">
      <div className="flex h-12 sm:h-16 items-center justify-between px-4 sm:px-6 lg:px-8 mb-4 sm:mb-6 lg:mb-8">
        <div className="sm:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-6 w-6 text-[#397060]" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-3/4 sm:max-w-sm">
              <SheetTitle className="sr-only">Main navigation</SheetTitle>
              <nav className="mt-8 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon as any;
                  const isActive = pathname === item.url;
                  return (
                    <SheetClose asChild key={item.title}>
                      <Link
                        href={item.url}
                        className={cn(
                          "flex w-full items-center gap-2 rounded p-2 text-sm",
                          isActive
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-accent hover:text-accent-foreground"
                        )}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    </SheetClose>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
        <div className="flex-1 flex items-center justify-center sm:justify-start gap-3 sm:gap-6">
          <Link href="/feed">
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-righteous text-[#397060] tracking-wide hover:text-[#2d5848] transition-colors">
              Yideshare
            </h1>
          </Link>
          <Link
            href={feedbackUrl}
            className="hidden sm:inline-flex rounded-full bg-[#397060] px-3 py-2 text-sm font-medium text-white hover:bg-[#2d5848] transition-colors lg:px-4"
          >
            Feedback
          </Link>
        </div>
        <div className="sm:hidden">
          <Link
            href={feedbackUrl}
            className="rounded-full bg-[#397060] px-2.5 py-1.5 text-xs font-medium text-white hover:bg-[#2d5848] transition-colors"
          >
            Feedback
          </Link>
        </div>
        <div className="hidden sm:flex items-center gap-6 lg:gap-16 sm:justify-start">
          <TopNavButtons />
        </div>
      </div>
    </header>
  );
}
