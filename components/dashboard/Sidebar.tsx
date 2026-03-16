"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, PieChart, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Client Stream", href: "/client-stream", icon: Users },
  { label: "Source Breakdown", href: "/source-breakdown", icon: PieChart },
  { label: "Settings", href: "/settings", icon: Settings },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col border-r bg-sidebar">
      {/* Logo */}
      <div className="flex h-14 items-center border-b px-5">
        <span className="text-base font-bold tracking-tight">
          <span style={{ color: "#E8380D" }}>Mystiv</span>
          <span className="text-foreground"> Dashboard</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "text-white"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
              style={isActive ? { backgroundColor: "#E8380D" } : undefined}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t px-5 py-3">
        <p className="text-xs text-muted-foreground">Internal use only</p>
      </div>
    </aside>
  );
}
