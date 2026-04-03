import { Check, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ApprovalItem {
  id: string;
  title: string;
  vendor: string;
  type: string;
  submittedAt: string;
}

const pendingApprovals: ApprovalItem[] = [
  {
    id: "1",
    title: "Summer Romance",
    vendor: "Romance Films Inc",
    type: "Movie",
    submittedAt: "10 min ago",
  },
  {
    id: "2",
    title: "Tech Today S1E5",
    vendor: "Documentary Hub",
    type: "Episode",
    submittedAt: "1 hour ago",
  },
  {
    id: "3",
    title: "Action Heroes",
    vendor: "Action Studios",
    type: "Movie",
    submittedAt: "3 hours ago",
  },
];

export function PendingApprovals() {
  return (
    <div className="glass-card rounded-xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">
          Pending Approvals
        </h3>
        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-warning/20 px-2 text-sm font-medium text-warning">
          {pendingApprovals.length}
        </span>
      </div>
      <div className="space-y-4">
        {pendingApprovals.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 rounded-lg border border-border/50 bg-secondary/30 p-4"
          >
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-accent/20 text-accent">
                {item.vendor.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{item.title}</p>
              <p className="text-sm text-muted-foreground">
                {item.type} • {item.vendor} • {item.submittedAt}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-success hover:bg-success/10 hover:text-success"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
