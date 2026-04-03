import { Plus, Upload, UserPlus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const actions = [
  {
    title: "Add Movie",
    description: "Upload a new movie",
    icon: Plus,
    variant: "default" as const,
  },
  {
    title: "Upload Content",
    description: "Bulk upload media",
    icon: Upload,
    variant: "secondary" as const,
  },
  {
    title: "Add Vendor",
    description: "Register new vendor",
    icon: UserPlus,
    variant: "secondary" as const,
  },
  {
    title: "Settings",
    description: "App configuration",
    icon: Settings,
    variant: "secondary" as const,
  },
];

export function QuickActions() {
  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="mb-6 font-display text-lg font-semibold">Quick Actions</h3>
      <div className="grid gap-3">
        {actions.map((action) => (
          <Button
            key={action.title}
            variant={action.variant}
            className="h-auto justify-start gap-4 p-4"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background/50">
              <action.icon className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="font-medium">{action.title}</p>
              <p className="text-xs text-muted-foreground">
                {action.description}
              </p>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
