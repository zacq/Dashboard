"use client";

import { useEffect, useState, useCallback } from "react";
import { UnifiedClientRecord } from "@/lib/types";
import { ClientStreamTable } from "@/components/dashboard/ClientStreamTable";
import { RecordDetailDrawer } from "@/components/dashboard/RecordDetailDrawer";

type DashboardData = {
  records: UnifiedClientRecord[];
};

export default function ClientStreamPage() {
  const [records, setRecords] = useState<UnifiedClientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<UnifiedClientRecord | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard-data");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: DashboardData = await res.json();
      setRecords(json.records);
    } catch (err) {
      console.error("[client-stream] Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Client Stream</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              All incoming clients from website and walk-in intake.
            </p>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <p className="text-muted-foreground">Loading records…</p>
            </div>
          ) : (
            <ClientStreamTable records={records} onView={setSelectedRecord} />
          )}
        </div>
      </div>

      <RecordDetailDrawer
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />
    </>
  );
}
