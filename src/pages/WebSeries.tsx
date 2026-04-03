import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, X, Clock, Star, Globe, Play, LayoutGrid, List, Tv, Film, Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useWebSeriesDB, WebSeriesDB } from "@/hooks/useWebSeriesDB";

const statusStyles = {
  published: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  draft: "bg-muted text-muted-foreground border-border",
};

export default function WebSeries() {
  const navigate = useNavigate();
  const { webSeries, isLoading, deleteWebSeries } = useWebSeriesDB();
  const [searchQuery, setSearchQuery] = useState("");
  const [previewSeries, setPreviewSeries] = useState<WebSeriesDB | null>(null);
  const [deleteSeriesId, setDeleteSeriesId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [genreFilter, setGenreFilter] = useState<string>("all");

  const filteredSeries = webSeries.filter(series => {
    const matchesSearch = series.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || series.status === statusFilter;
    const matchesGenre = genreFilter === "all" || series.genre.toLowerCase() === genreFilter;
    return matchesSearch && matchesStatus && matchesGenre;
  });

  const handlePreview = (series: WebSeriesDB) => {
    setPreviewSeries(series);
  };

  const handleEdit = (seriesId: string) => {
    navigate(`/web-series/edit/${seriesId}`);
  };

  const handleDelete = async () => {
    if (deleteSeriesId) {
      const success = await deleteWebSeries(deleteSeriesId);
      if (success) {
        toast.success("Web Series deleted successfully");
      }
      setDeleteSeriesId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
            Web Series
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your OTT web series collection ({webSeries.length} total)
          </p>
        </div>
        <Button className="gap-2" onClick={() => navigate("/web-series/add")}>
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Web Series</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="glass-card flex flex-col gap-3 rounded-xl p-3 sm:p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search web series..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[110px] sm:w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Select value={genreFilter} onValueChange={setGenreFilter}>
            <SelectTrigger className="w-[110px] sm:w-[130px]">
              <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all">All Genres</SelectItem>
              <SelectItem value="drama">Drama</SelectItem>
              <SelectItem value="thriller">Thriller</SelectItem>
              <SelectItem value="comedy">Comedy</SelectItem>
              <SelectItem value="action">Action</SelectItem>
              <SelectItem value="romance">Romance</SelectItem>
              <SelectItem value="sci-fi">Sci-Fi</SelectItem>
            </SelectContent>
          </Select>
          
          {/* View Toggle */}
          <div className="flex items-center rounded-lg border border-border bg-secondary/30 p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "flex items-center justify-center rounded-md p-1.5 transition-all",
                viewMode === "grid"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "flex items-center justify-center rounded-md p-1.5 transition-all",
                viewMode === "list"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredSeries.length === 0 && (
        <div className="glass-card flex flex-col items-center justify-center rounded-xl p-12 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <Film className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">No web series found</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            {searchQuery || statusFilter !== "all" || genreFilter !== "all"
              ? "Try adjusting your filters"
              : "Get started by adding your first web series"}
          </p>
          <Button onClick={() => navigate("/web-series/add")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Web Series
          </Button>
        </div>
      )}

      {/* Grid View */}
      {viewMode === "grid" && filteredSeries.length > 0 && (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {filteredSeries.map((series) => (
            <div
              key={series.id}
              className="glass-card group overflow-hidden rounded-lg transition-all hover:scale-[1.02] hover:shadow-lg"
            >
              <div className="relative aspect-[2/3] overflow-hidden">
                <img
                  src={series.thumbnail_url || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=450&fit=crop"}
                  alt={series.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="absolute bottom-2 left-2 right-2 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="h-7 flex-1 gap-1 text-xs"
                    onClick={() => handlePreview(series)}
                  >
                    <Eye className="h-3 w-3" />
                    <span className="hidden sm:inline">Preview</span>
                  </Button>
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="h-7 w-7 p-0"
                    onClick={() => handleEdit(series.id)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
                <Badge 
                  variant="outline" 
                  className={`absolute left-1.5 top-1.5 text-[10px] px-1.5 py-0 ${statusStyles[series.status]}`}
                >
                  {series.status}
                </Badge>
                {/* Episode Count Badge */}
                <div className="absolute right-1.5 top-1.5 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
                  <Tv className="h-3 w-3" />
                  {series.total_episodes} ep
                </div>
              </div>
              <div className="p-2">
                <div className="mb-1 flex items-start justify-between gap-1">
                  <h3 className="text-xs sm:text-sm font-semibold line-clamp-1">{series.title}</h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5 sm:h-6 sm:w-6 shrink-0">
                        <MoreHorizontal className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handlePreview(series)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(series.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => setDeleteSeriesId(series.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex flex-wrap items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                  <span>{series.genre}</span>
                  <span>•</span>
                  <span>⭐ {series.rating || "N/A"}</span>
                </div>
                {series.vendor_name && (
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Building2 className="h-3 w-3" />
                    <span className="line-clamp-1">{series.vendor_name}</span>
                  </div>
                )}
                {series.subscription_required && (
                  <Badge variant="outline" className="mt-1 text-[10px] px-1.5 py-0 border-primary/20 bg-primary/10 text-primary">
                    Premium
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && filteredSeries.length > 0 && (
        <div className="glass-card overflow-hidden rounded-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Series</th>
                  <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Genre</th>
                  <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Vendor</th>
                  <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Episodes</th>
                  <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Rating</th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-3 sm:px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSeries.map((series) => (
                  <tr key={series.id} className="transition-colors hover:bg-secondary/20">
                    <td className="px-3 sm:px-4 py-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <img
                          src={series.thumbnail_url || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=450&fit=crop"}
                          alt={series.title}
                          className="h-10 w-7 sm:h-12 sm:w-8 rounded object-cover"
                        />
                        <div>
                          <p className="text-sm font-medium">{series.title}</p>
                          <p className="hidden sm:block text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                            {series.description || "No description"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3 text-sm">{series.genre}</td>
                    <td className="hidden md:table-cell px-4 py-3">
                      {series.vendor_name ? (
                        <div className="flex items-center gap-1.5 text-sm">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{series.vendor_name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3 text-sm">{series.total_episodes}</td>
                    <td className="hidden lg:table-cell px-4 py-3">
                      <span className="flex items-center gap-1 text-sm">
                        <Star className="h-3.5 w-3.5 text-yellow-500" />
                        {series.rating || "N/A"}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <Badge variant="outline" className={cn("text-xs", statusStyles[series.status])}>
                        {series.status}
                      </Badge>
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 sm:h-8 sm:w-8"
                          onClick={() => handlePreview(series)}
                        >
                          <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 sm:h-8 sm:w-8"
                          onClick={() => handleEdit(series.id)}
                        >
                          <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 sm:h-8 sm:w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteSeriesId(series.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewSeries} onOpenChange={() => setPreviewSeries(null)}>
        <DialogContent className="max-w-2xl overflow-hidden p-0">
          {previewSeries && (
            <>
              <div className="relative aspect-video w-full overflow-hidden">
                <img
                  src={previewSeries.thumbnail_url || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=450&fit=crop"}
                  alt={previewSeries.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-8 w-8 bg-black/50 text-white hover:bg-black/70"
                  onClick={() => setPreviewSeries(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="absolute bottom-4 left-4 right-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">{previewSeries.title}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-white/80">
                    <Badge variant="outline" className={statusStyles[previewSeries.status]}>
                      {previewSeries.status}
                    </Badge>
                    <span className="flex items-center gap-1">
                      <Tv className="h-3.5 w-3.5" />
                      {previewSeries.total_episodes} Episodes
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-yellow-400" />
                      {previewSeries.rating || "N/A"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Globe className="h-3.5 w-3.5" />
                      {previewSeries.language}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-4 p-4 sm:p-6">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{previewSeries.genre}</Badge>
                  {previewSeries.subscription_required && (
                    <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                      Premium
                    </Badge>
                  )}
                </div>
                {previewSeries.vendor_name && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span>Uploaded by: <strong>{previewSeries.vendor_name}</strong></span>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">{previewSeries.description || "No description available."}</p>
                <div className="flex gap-2 pt-2">
                  <Button className="flex-1 gap-2">
                    <Play className="h-4 w-4" />
                    Watch Now
                  </Button>
                  <Button variant="outline" onClick={() => handleEdit(previewSeries.id)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteSeriesId} onOpenChange={() => setDeleteSeriesId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Web Series</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this web series? This will also delete all associated seasons and episodes. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
