"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { UnifiedClientRecord } from "@/lib/types";
import { SourceBadge } from "@/components/dashboard/SourceBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PAGE_SIZE = 25;

type SourceFilter = "all" | "website" | "walk_in";

const STATUS_STYLES: Record<UnifiedClientRecord["normalizedStatus"], string> = {
  New: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  Active: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  "In Progress": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  Complete: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  Other: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;
  return date.toLocaleString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <Button
      variant="ghost"
      size="icon-xs"
      onClick={handleCopy}
      aria-label="Copy phone number"
      className="ml-1 shrink-0"
    >
      {copied ? <Check className="size-3 text-green-600" /> : <Copy className="size-3" />}
    </Button>
  );
}

type Props = {
  records: UnifiedClientRecord[];
  onView: (record: UnifiedClientRecord) => void;
};

export function ClientStreamTable({ records, onView }: Props) {
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [page, setPage] = useState(1);

  const filtered = records
    .filter((r) => {
      if (sourceFilter === "website") return r.sourceSystem === "website";
      if (sourceFilter === "walk_in") return r.sourceSystem === "walk_in";
      return true;
    })
    .filter((r) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        r.clientName.toLowerCase().includes(q) ||
        r.phoneNumber.toLowerCase().includes(q)
      );
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleSourceChange(value: string) {
    setSourceFilter(value as SourceFilter);
    setPage(1);
  }

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={sourceFilter} onValueChange={handleSourceChange}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="website">Website</TabsTrigger>
            <TabsTrigger value="walk_in">Walk-In</TabsTrigger>
          </TabsList>
        </Tabs>
        <Input
          type="search"
          placeholder="Search by name or phone…"
          value={search}
          onChange={handleSearch}
          className="w-full sm:w-64"
        />
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Received</TableHead>
            <TableHead>Client Name</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Status</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginated.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                No records found.
              </TableCell>
            </TableRow>
          ) : (
            paginated.map((record) => {
              const missingPhone = !record.phoneNumber || record.phoneNumber.trim() === "";
              return (
                <TableRow key={record.id}>
                  <TableCell className="text-muted-foreground">
                    {formatDateTime(record.receivedAt)}
                  </TableCell>
                  <TableCell className="font-medium">{record.clientName || "—"}</TableCell>
                  <TableCell>
                    {missingPhone ? (
                      <span className="rounded px-1.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                        Missing
                      </span>
                    ) : (
                      <span className="inline-flex items-center">
                        {record.phoneNumber}
                        <CopyButton text={record.phoneNumber} />
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <SourceBadge sourceSystem={record.sourceSystem} />
                  </TableCell>
                  <TableCell className="max-w-[160px] truncate text-muted-foreground">
                    {record.vehicleSummary || "—"}
                  </TableCell>
                  <TableCell className="max-w-[180px] truncate text-muted-foreground">
                    {record.serviceSummary || "—"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[record.normalizedStatus]}`}
                    >
                      {record.normalizedStatus}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => onView(record)}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {filtered.length === 0
            ? "No results"
            : `${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, filtered.length)} of ${filtered.length}`}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
