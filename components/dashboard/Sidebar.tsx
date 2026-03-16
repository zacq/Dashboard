"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, PieChart, Settings, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Client Stream", href: "/client-stream", icon: Users },
  { label: "Source Breakdown", href: "/source-breakdown", icon: PieChart },
  { label: "Settings", href: "/settings", icon: Settings },
] as const;

function Logo() {
  return (
    <span className="text-base font-bold tracking-tight">
      <span style={{ color: "#E8380D" }}>Mystiv</span>
      <span className="text-foreground"> Dashboard</span>
    </span>
  );
}

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
      {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
        const isActive =
          href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
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
  );
}

function SidebarFooter() {
  return (
    <div className="border-t px-5 py-3">
      <p className="text-xs text-muted-foreground">Internal use only</p>
    </div>
  );
}

// Desktop sidebar — hidden on mobile
export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden lg:flex h-screen w-56 shrink-0 flex-col border-r bg-sidebar">
      <div className="flex h-14 items-center border-b px-5">
        <Logo />
      </div>
      <NavLinks pathname={pathname} />
      <SidebarFooter />
    </aside>
  );
}

// Mobile top bar with hamburger + slide-in drawer
export function MobileHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="lg:hidden flex h-14 shrink-0 items-center justify-between border-b bg-sidebar px-4">
        <Logo />
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
        >
          <Menu className="size-5" />
        </Button>
      </header>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar shadow-xl">
            <div className="flex h-14 items-center justify-between border-b px-5">
              <Logo />
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
            <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
            <SidebarFooter />
          </div>
        </>
      )}
    </>
  );
}
