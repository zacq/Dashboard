import { type LucideIcon } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

type Props = {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  change?: string;
};

export function KPICard({ label, value, icon: Icon, change }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        {Icon && (
          <CardAction>
            <Icon size={20} style={{ color: "#E8380D" }} />
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
      </CardContent>
      {change && (
        <CardFooter>
          <p className="text-xs text-muted-foreground">{change}</p>
        </CardFooter>
      )}
    </Card>
  );
}
