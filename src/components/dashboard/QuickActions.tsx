import { Plus, Upload, UserPlus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Empty } from "antd";

const actions = [
 
];

export function QuickActions() {
  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="mb-6 font-display text-lg font-semibold">Quick Actions</h3>
      <div className="grid gap-3">
       <Empty/>
      </div>
    </div>
  );
}
