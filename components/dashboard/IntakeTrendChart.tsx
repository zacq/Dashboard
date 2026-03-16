"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { UnifiedClientRecord } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const WEBSITE_COLOR = "#3b82f6"; // blue-500
const WALKIN_COLOR = "#22c55e";  // green-500
const DAYS_TO_SHOW = 14;

function buildChartData(records: UnifiedClientRecord[]) {
  // Build the last 14 calendar days (most recent last)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days: { date: Date; label: string; website: number; walk_in: number }[] = [];
  for (let i = DAYS_TO_SHOW - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push({
      date: d,
      label: d.toLocaleDateString("en-AU", { day: "2-digit", month: "short" }),
      website: 0,
      walk_in: 0,
    });
  }

  const windowStart = days[0].date;

  for (const record of records) {
    const receivedAt = new Date(record.receivedAt);
    receivedAt.setHours(0, 0, 0, 0);
    if (receivedAt < windowStart) continue;

    const dayEntry = days.find((d) => d.date.getTime() === receivedAt.getTime());
    if (!dayEntry) continue;

    if (record.sourceSystem === "website") {
      dayEntry.website += 1;
    } else {
      dayEntry.walk_in += 1;
    }
  }

  return days.map(({ label, website, walk_in }) => ({ label, website, walk_in }));
}

type Props = {
  records: UnifiedClientRecord[];
};

export function IntakeTrendChart({ records }: Props) {
  const data = buildChartData(records);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Intake Trend — Last {DAYS_TO_SHOW} Days
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} barCategoryGap="30%" barGap={3}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              width={24}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }}
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            />
            <Legend
              wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
              formatter={(value) =>
                value === "website" ? "Website Booking" : "Walk-In Job Card"
              }
            />
            <Bar dataKey="website" name="website" fill={WEBSITE_COLOR} radius={[3, 3, 0, 0]} />
            <Bar dataKey="walk_in" name="walk_in" fill={WALKIN_COLOR} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
