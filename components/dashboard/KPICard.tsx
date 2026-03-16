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
        <CardTitle className="text-xs font-medium text-muted-foreground leading-snug whitespace-normal">
          {label}
        </CardTitle>
        {Icon && (
          <CardAction>
            <Icon size={18} style={{ color: "#E8380D" }} />
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold tracking-tight sm:text-3xl">{value}</p>
      </CardContent>
      {change && (
        <CardFooter>
          <p className="text-xs text-muted-foreground">{change}</p>
        </CardFooter>
      )}
    </Card>
  );
}
