"use client";

import { useState } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { X, Copy, Check, Phone, Mail, Car, Wrench, Calendar, Clock, User } from "lucide-react";
import { UnifiedClientRecord } from "@/lib/types";
import { SourceBadge } from "@/components/dashboard/SourceBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;
  return date.toLocaleString("en-AU", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function DetailRow({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  if (!value) return null;
  return (
    <div className={cn("flex gap-3", className)}>
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="text-sm font-medium break-words">{value}</div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: UnifiedClientRecord["normalizedStatus"] }) {
  const styles: Record<UnifiedClientRecord["normalizedStatus"], string> = {
    New: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    Active: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    "In Progress": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    Complete: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    Cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    Other: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", styles[status])}>
      {status}
    </span>
  );
}

function CopyPhoneButton({ phone }: { phone: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(phone).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <div className="flex items-center gap-2">
      <span className="text-xl font-bold tracking-wide">{phone}</span>
      <Button variant="ghost" size="icon-sm" onClick={handleCopy} aria-label="Copy phone number">
        {copied ? <Check className="size-4 text-green-600" /> : <Copy className="size-4" />}
      </Button>
    </div>
  );
}

type Props = {
  record: UnifiedClientRecord | null;
  onClose: () => void;
};

export function RecordDetailDrawer({ record, onClose }: Props) {
  return (
    <DialogPrimitive.Root open={record !== null} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={cn(
            "fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-background shadow-xl ring-1 ring-foreground/10 outline-none",
            "data-open:animate-in data-open:slide-in-from-right data-closed:animate-out data-closed:slide-out-to-right duration-200"
          )}
        >
          {record && (
            <>
              {/* Header */}
              <div className="flex items-start justify-between gap-4 border-b px-6 py-4">
                <div className="min-w-0">
                  <DialogPrimitive.Title className="truncate text-lg font-semibold leading-snug">
                    {record.clientName || "Unknown Client"}
                  </DialogPrimitive.Title>
                  <div className="mt-1.5 flex items-center gap-2">
                    <SourceBadge sourceSystem={record.sourceSystem} />
                    <StatusPill status={record.normalizedStatus} />
                  </div>
                </div>
                <DialogPrimitive.Close asChild>
                  <Button variant="ghost" size="icon-sm" aria-label="Close" className="shrink-0">
                    <X className="size-4" />
                  </Button>
                </DialogPrimitive.Close>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                {/* Phone — hero treatment */}
                <div className="rounded-lg bg-muted/50 px-4 py-3">
                  <p className="mb-1 text-xs text-muted-foreground">Phone Number</p>
                  {record.phoneNumber ? (
                    <CopyPhoneButton phone={record.phoneNumber} />
                  ) : (
                    <span className="rounded px-2 py-0.5 text-sm font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                      Not captured
                    </span>
                  )}
                </div>

                {/* Core details */}
                <div className="space-y-4">
                  <DetailRow
                    icon={Calendar}
                    label="Received"
                    value={formatDateTime(record.receivedAt)}
                  />
                  <DetailRow
                    icon={Mail}
                    label="Email Address"
                    value={record.emailAddress}
                  />
                  <DetailRow
                    icon={Car}
                    label="Vehicle"
                    value={record.vehicleSummary}
                  />
                  <DetailRow
                    icon={Wrench}
                    label="Service"
                    value={record.serviceSummary}
                  />
                </div>

                {/* Status */}
                <div className="space-y-2 border-t pt-4">
                  <div className="flex gap-3">
                    <div className="mt-0.5 size-4 shrink-0" />
                    <div className="space-y-1.5">
                      <div>
                        <p className="text-xs text-muted-foreground">Normalised Status</p>
                        <div className="mt-0.5">
                          <StatusPill status={record.normalizedStatus} />
                        </div>
                      </div>
                      {record.rawStatus && (
                        <div>
                          <p className="text-xs text-muted-foreground">Raw Status</p>
                          <p className="text-sm font-medium">{record.rawStatus}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Website-only fields */}
                {record.sourceSystem === "website" && (
                  <div className="space-y-4 border-t pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Booking Preference
                    </p>
                    <DetailRow
                      icon={Calendar}
                      label="Preferred Date"
                      value={record.preferredDate}
                    />
                    <DetailRow
                      icon={Clock}
                      label="Preferred Time"
                      value={record.preferredTime}
                    />
                  </div>
                )}

                {/* Walk-in-only fields */}
                {record.sourceSystem === "walk_in" && (
                  <div className="space-y-4 border-t pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Workshop
                    </p>
                    <DetailRow
                      icon={User}
                      label="Advisor"
                      value={record.advisor}
                    />
                    <DetailRow
                      icon={User}
                      label="Technician"
                      value={record.technician}
                    />
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t px-6 py-4">
                <DialogPrimitive.Close asChild>
                  <Button variant="outline" className="w-full">
                    Close
                  </Button>
                </DialogPrimitive.Close>
              </div>
            </>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
