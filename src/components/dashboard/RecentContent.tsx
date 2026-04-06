import { Badge } from "@/components/ui/badge";
import { Empty } from "antd";
import { Film, Tv, Video } from "lucide-react";

interface ContentItem {
  id: string;
  title: string;
  type: "movie" | "series" | "short";
  status: "published" | "pending" | "draft";
  uploadedAt: string;
  vendor?: string;
}

const recentContent: ContentItem[] = [
 
];

const typeIcons = {
  movie: Film,
  series: Tv,
  short: Video,
};

const statusStyles = {
  published: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  draft: "bg-muted text-muted-foreground border-border",
};

export function RecentContent() {
  return (
    <div className="glass-card rounded-xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">Recent Content</h3>
        <button className="text-sm text-primary hover:underline">
          View all
        </button>
      </div>
      <div className="space-y-4">
       <Empty/>
      </div>
    </div>
  );
}
