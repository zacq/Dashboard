export type UnifiedClientRecord = {
  id: string;
  sourceSystem: "website" | "walk_in";
  sourceLabel: "Website Booking" | "Walk-In Job Card";
  clientName: string;
  phoneNumber: string;
  emailAddress?: string;
  vehicleSummary?: string;
  serviceSummary?: string;
  receivedAt: string;
  normalizedStatus: "New" | "Active" | "In Progress" | "Complete" | "Cancelled" | "Other";
  rawStatus?: string;
  preferredDate?: string;
  preferredTime?: string;
  advisor?: string;
  technician?: string;
};

export type DashboardMetric = {
  label: string;
  value: number | string;
  icon?: string;
  change?: string;
};

export type SourceSummary = {
  websiteCount: number;
  walkInCount: number;
  totalCount: number;
  phoneCaptureCount: number;
  phoneCaptureRate: number;
};
