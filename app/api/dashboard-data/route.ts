import { NextResponse } from "next/server";
import { fetchWebsiteRecords } from "@/lib/airtable/website";
import { fetchWalkinsRecords } from "@/lib/airtable/walkins";
import { normalizeWebsiteBooking, normalizeWalkIn } from "@/lib/airtable/normalize";
import { UnifiedClientRecord, SourceSummary } from "@/lib/types";

type SyncStatus = {
  website: "ok" | "error";
  walkIn: "ok" | "error";
  errors: { source: string; message: string }[];
};

export async function GET() {
  const [websiteResult, walkInsResult] = await Promise.allSettled([
    fetchWebsiteRecords(),
    fetchWalkinsRecords(),
  ]);

  const syncStatus: SyncStatus = {
    website: "ok",
    walkIn: "ok",
    errors: [],
  };

  let websiteRecords: UnifiedClientRecord[] = [];
  let walkInRecords: UnifiedClientRecord[] = [];

  if (websiteResult.status === "fulfilled") {
    websiteRecords = websiteResult.value.map(normalizeWebsiteBooking);
  } else {
    syncStatus.website = "error";
    syncStatus.errors.push({
      source: "website",
      message: websiteResult.reason instanceof Error
        ? websiteResult.reason.message
        : "Unknown error fetching website bookings",
    });
  }

  if (walkInsResult.status === "fulfilled") {
    walkInRecords = walkInsResult.value.map(normalizeWalkIn);
  } else {
    syncStatus.walkIn = "error";
    syncStatus.errors.push({
      source: "walkIn",
      message: walkInsResult.reason instanceof Error
        ? walkInsResult.reason.message
        : "Unknown error fetching walk-in records",
    });
  }

  const merged = [...websiteRecords, ...walkInRecords].sort(
    (a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
  );

  const phoneCaptureCount = merged.filter(
    (r) => r.phoneNumber && r.phoneNumber.trim().length > 0
  ).length;

  const sourceSummary: SourceSummary = {
    websiteCount: websiteRecords.length,
    walkInCount: walkInRecords.length,
    totalCount: merged.length,
    phoneCaptureCount,
    phoneCaptureRate: merged.length > 0
      ? Math.round((phoneCaptureCount / merged.length) * 100)
      : 0,
  };

  return NextResponse.json({
    records: merged,
    sourceSummary,
    syncStatus,
  });
}
