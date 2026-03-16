import { Badge } from "@/components/ui/badge";
import { UnifiedClientRecord } from "@/lib/types";

type Props = {
  sourceSystem: UnifiedClientRecord["sourceSystem"];
};

const config = {
  website: {
    label: "Website Booking",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
  walk_in: {
    label: "Walk-In Job Card",
    className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
} as const;

export function SourceBadge({ sourceSystem }: Props) {
  const { label, className } = config[sourceSystem];
  return (
    <Badge variant="secondary" className={className}>
      {label}
    </Badge>
  );
}
