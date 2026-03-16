import { FieldSet, Record } from "airtable";
import { UnifiedClientRecord } from "@/lib/types";

// The airtable package exposes createdTime at runtime but omits it from
// its TypeScript types. This helper retrieves it safely.
function getCreatedTime(record: Record<FieldSet>): string {
  return (record as unknown as { createdTime: string }).createdTime ?? new Date().toISOString();
}

function normalizeStatus(raw: string | undefined): UnifiedClientRecord["normalizedStatus"] {
  switch (raw) {
    case "New":
    case "🆕 New":
    case "Open":
      return "New";
    case "Reviewed":
    case "📋 Reviewed":
    case "Confirmed":
    case "✅ Confirmed":
    case "Awaiting Parts":
      return "Active";
    case "In Progress":
    case "🔧 In Progress":
      return "In Progress";
    case "Complete":
    case "✔️ Completed":
    case "Invoiced":
      return "Complete";
    case "Cancelled":
    case "❌ Cancelled":
      return "Cancelled";
    default:
      return "Other";
  }
}

function str(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export function normalizeWebsiteBooking(record: Record<FieldSet>): UnifiedClientRecord {
  const f = record.fields;
  const rawStatus = str(f["Status"]);

  return {
    id: record.id,
    sourceSystem: "website",
    sourceLabel: "Website Booking",
    clientName: str(f["Full Name"]) ?? "",
    phoneNumber: str(f["Phone Number"]) ?? "",
    emailAddress: str(f["Email Address"]),
    vehicleSummary: str(f["Vehicle"]),
    serviceSummary: str(f["Service Requested"]),
    receivedAt: getCreatedTime(record),
    normalizedStatus: normalizeStatus(rawStatus),
    rawStatus,
  };
}

export function normalizeWalkIn(record: Record<FieldSet>): UnifiedClientRecord {
  const f = record.fields;
  const rawStatus = str(f["Status"]);

  const vehicleParts = [str(f["Make"]), str(f["Model"]), str(f["Registration"])].filter(Boolean);
  const vehicleSummary = vehicleParts.length > 0 ? vehicleParts.join(" ") : undefined;

  return {
    id: record.id,
    sourceSystem: "walk_in",
    sourceLabel: "Walk-In Job Card",
    clientName: str(f["Client Name"]) ?? "",
    phoneNumber: str(f["Phone"]) ?? "",
    emailAddress: str(f["Email"]),
    vehicleSummary,
    serviceSummary: str(f["Services"]),
    receivedAt: str(f["Date Received"]) ?? getCreatedTime(record),
    normalizedStatus: normalizeStatus(rawStatus),
    rawStatus,
  };
}
