import { Check, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Empty } from "antd";

interface ApprovalItem {
  id: string;
  title: string;
  vendor: string;
  type: string;
  submittedAt: string;
}

const pendingApprovals: ApprovalItem[] = [
  
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
        <Empty/>
      </div>
    </div>
  );
}
