"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users,
  Globe,
  FootprintsIcon,
  Phone,
  CalendarCheck,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { UnifiedClientRecord, SourceSummary } from "@/lib/types";
import { KPICard } from "@/components/dashboard/KPICard";
import { IntakeTrendChart } from "@/components/dashboard/IntakeTrendChart";
import { SourceBadge } from "@/components/dashboard/SourceBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const REFRESH_INTERVAL_MS = 60_000;

type SyncStatus = {
  website: "ok" | "error";
  walkIn: "ok" | "error";
  errors: { source: string; message: string }[];
};

type DashboardData = {
  records: UnifiedClientRecord[];
  sourceSummary: SourceSummary;
  syncStatus: SyncStatus;
};

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes === 1) return "1 min ago";
  return `${minutes} mins ago`;
}

function formatRelativeTime(value: string): string {
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString("en-AU", { day: "2-digit", month: "short" });
}

function countTodayClients(records: UnifiedClientRecord[]): number {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  return records.filter((r) => new Date(r.receivedAt) >= todayStart).length;
}

function SyncStatusCard({
  syncStatus,
  lastUpdated,
}: {
  syncStatus: SyncStatus;
  lastUpdated: Date;
}) {
  const allOk = syncStatus.website === "ok" && syncStatus.walkIn === "ok";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Data Sources
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            {syncStatus.website === "ok" ? (
              <CheckCircle2 className="size-4 text-green-500" />
            ) : (
              <AlertCircle className="size-4 text-red-500" />
            )}
            <span>Website Bookings</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {syncStatus.website === "ok" ? "Connected" : "Error"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            {syncStatus.walkIn === "ok" ? (
              <CheckCircle2 className="size-4 text-green-500" />
            ) : (
              <AlertCircle className="size-4 text-red-500" />
            )}
            <span>Walk-In Job Cards</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {syncStatus.walkIn === "ok" ? "Connected" : "Error"}
          </span>
        </div>
        {!allOk && syncStatus.errors.length > 0 && (
          <div className="rounded-md bg-red-50 px-3 py-2 dark:bg-red-950">
            {syncStatus.errors.map((e) => (
              <p key={e.source} className="text-xs text-red-700 dark:text-red-300">
                {e.source}: {e.message}
              </p>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Last updated: {formatTimeAgo(lastUpdated)}
        </p>
      </CardContent>
    </Card>
  );
}

function LatestContactsWidget({ records }: { records: UnifiedClientRecord[] }) {
  const latest = records.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Latest Contacts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {latest.length === 0 ? (
          <p className="text-sm text-muted-foreground">No records yet.</p>
        ) : (
          latest.map((record) => (
            <div key={record.id} className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {record.clientName || "Unknown"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {record.phoneNumber || (
                    <span className="rounded px-1 py-px text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                      No phone
                    </span>
                  )}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <SourceBadge sourceSystem={record.sourceSystem} />
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(record.receivedAt)}
                </span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export default function OverviewPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch("/api/dashboard-data");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: DashboardData = await res.json();
      setData(json);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("[overview] Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh
  useEffect(() => {
    const id = setInterval(() => fetchData(), REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">

        {/* Page header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              Mystiv Client Stream
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Real-time view of website bookings and walk-in job cards.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(true)}
            disabled={refreshing || loading}
            className="shrink-0 gap-1.5"
          >
            <RefreshCw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">{refreshing ? "Refreshing…" : "Refresh"}</span>
          </Button>
        </div>

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="h-24 animate-pulse rounded-xl bg-muted/50" />
              </Card>
            ))}
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* KPI row */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <KPICard
                label="Total Clients"
                value={data.sourceSummary.totalCount}
                icon={Users}
              />
              <KPICard
                label="Website Bookings"
                value={data.sourceSummary.websiteCount}
                icon={Globe}
              />
              <KPICard
                label="Walk-In Clients"
                value={data.sourceSummary.walkInCount}
                icon={FootprintsIcon}
              />
              <KPICard
                label="Phone Numbers Captured"
                value={`${data.sourceSummary.phoneCaptureCount} (${data.sourceSummary.phoneCaptureRate}%)`}
                icon={Phone}
              />
              <KPICard
                label="Today's Clients"
                value={countTodayClients(data.records)}
                icon={CalendarCheck}
              />
            </div>

            {/* Chart + sidebar */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <IntakeTrendChart records={data.records} />
              </div>
              <div className="flex flex-col gap-6">
                <SyncStatusCard
                  syncStatus={data.syncStatus}
                  lastUpdated={lastUpdated}
                />
                <LatestContactsWidget records={data.records} />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center">
            <p className="text-muted-foreground">
              Failed to load dashboard data. Try refreshing.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
