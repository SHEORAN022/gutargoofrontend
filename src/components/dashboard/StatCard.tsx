import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "primary" | "success" | "warning" | "info";
}

const variantStyles = {
  default: "from-secondary to-secondary/50",
  primary: "from-primary/20 to-primary/5",
  success: "from-success/20 to-success/5",
  warning: "from-warning/20 to-warning/5",
  info: "from-info/20 to-info/5",
};

const iconVariantStyles = {
  default: "bg-secondary text-foreground",
  primary: "bg-primary/20 text-primary",
  success: "bg-success/20 text-success",
  warning: "bg-warning/20 text-warning",
  info: "bg-info/20 text-info",
};

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  variant = "default",
}: StatCardProps) {
  return (
    <div
      className={cn(
        "stat-card relative overflow-hidden bg-gradient-to-br",
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="font-display text-3xl font-bold tracking-tight">
            {value}
          </p>
          {trend && (
            <p
              className={cn(
                "flex items-center gap-1 text-sm font-medium",
                trend.isPositive ? "text-success" : "text-destructive"
              )}
            >
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              <span className="text-muted-foreground">vs last month</span>
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl",
            iconVariantStyles[variant]
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
