import { Badge } from "@/components/ui/badge";
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
  {
    id: "1",
    title: "The Last Frontier",
    type: "movie",
    status: "pending",
    uploadedAt: "2 hours ago",
    vendor: "Studio Alpha",
  },
  {
    id: "2",
    title: "Dark Mysteries S2",
    type: "series",
    status: "published",
    uploadedAt: "5 hours ago",
  },
  {
    id: "3",
    title: "Quick Laughs",
    type: "short",
    status: "draft",
    uploadedAt: "1 day ago",
    vendor: "Comedy Central",
  },
  {
    id: "4",
    title: "Space Odyssey",
    type: "movie",
    status: "pending",
    uploadedAt: "2 days ago",
    vendor: "Sci-Fi Studios",
  },
  {
    id: "5",
    title: "Crime Files S5",
    type: "series",
    status: "published",
    uploadedAt: "3 days ago",
  },
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
        {recentContent.map((item) => {
          const Icon = typeIcons[item.type];
          return (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-lg border border-border/50 bg-secondary/30 p-4 transition-colors hover:bg-secondary/50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.title}</p>
                <p className="text-sm text-muted-foreground">
                  {item.vendor ? `by ${item.vendor} • ` : ""}
                  {item.uploadedAt}
                </p>
              </div>
              <Badge variant="outline" className={statusStyles[item.status]}>
                {item.status}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}
