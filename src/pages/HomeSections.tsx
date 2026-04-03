import { useState, useEffect } from "react";
import { useHomeSections, HomeSection, SectionFormData, SectionType, ContentSource, DisplayStyle, AppTab, useSectionItems } from "@/hooks/useHomeSections";
import { useCategories } from "@/hooks/useCategories";
import { useMoviesDB } from "@/hooks/useMoviesDB";
import { useWebSeriesDB } from "@/hooks/useWebSeriesDB";
import { useTVShowsDB } from "@/hooks/useTVShowsDB";
import { useShortMoviesDB } from "@/hooks/useShortMoviesDB";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Pencil, Trash2, GripVertical, LayoutGrid, Rows3, Eye, EyeOff, TrendingUp, Clock, Star, Heart, FolderOpen, List, X, Film, Tv } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {getSectionAPI} from "../api/section"

const SECTION_TYPES: { value: SectionType; label: string; icon: React.ElementType; description: string }[] = [
  { value: "continue_watching", label: "Continue Watching", icon: Clock, description: "User's in-progress content" },
  { value: "trending_now", label: "Trending Now", icon: TrendingUp, description: "Popular content based on views" },
  { value: "latest_releases", label: "Latest Releases", icon: Star, description: "Recently added content" },
  { value: "top_rated", label: "Top Rated", icon: Star, description: "Highest rated content" },
  { value: "recommended", label: "Recommended", icon: Heart, description: "Personalized suggestions" },
  { value: "category_based", label: "Category Based", icon: FolderOpen, description: "Content from specific category" },
  { value: "custom_collection", label: "Custom Collection", icon: List, description: "Manually selected content" },
];

const CONTENT_SOURCES: { value: ContentSource; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "most_viewed", label: "Most Viewed" },
  { value: "recently_added", label: "Recently Added" },
  { value: "watch_time_based", label: "Watch Time Based" },
  { value: "admin_selected", label: "Admin Selected" },
];

const CONTENT_TYPES = [
  { value: "all", label: "All Content" },
  { value: "movies", label: "Movies Only" },
  { value: "web_series", label: "Web Series Only" },
  { value: "tv_shows", label: "TV Shows Only" },
  { value: "short_movies", label: "Short Movies Only" },
];

const TAB_OPTIONS: { value: AppTab; label: string }[] = [
  { value: "home", label: "Home" },
  { value: "originals", label: "Originals" },
  { value: "movies", label: "Movies" },
  { value: "tv_shows", label: "TV Shows" },
  { value: "web_series", label: "Web Series" },
  { value: "short_movies", label: "Short Movies" },
];

function SectionIcon({ type }: { type: SectionType }) {
  const section = SECTION_TYPES.find(s => s.value === type);
  const Icon = section?.icon || List;
  return <Icon className="h-4 w-4" />;
}

function SortableSectionCard({ section, onEdit, onDelete }: { section: HomeSection; onEdit: (s: HomeSection) => void; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getDisplayStyleLabel = () => {
    const labels: Record<string, string> = {
      horizontal_banner: "H Banner",
      vertical_banner: "V Banner",
      big_horizontal: "Big H",
      big_vertical: "Big V",
      index_horizontal: "Index H",
      index_vertical: "Index V",
    };
    return labels[section.display_style] || section.display_style;
  };

  return (
    <Card ref={setNodeRef} style={style} className="group">
      <CardContent className="flex items-center gap-4 p-4">
        <div {...attributes} {...listeners} className="cursor-grab p-1">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <SectionIcon type={section.section_type} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium truncate">{section.title}</h3>
            {section.is_active ? (
              <Badge className="bg-green-500/10 text-green-600 text-xs"><Eye className="mr-1 h-3 w-3" />Active</Badge>
            ) : (
              <Badge variant="secondary" className="text-xs"><EyeOff className="mr-1 h-3 w-3" />Inactive</Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">{section.section_type.replace(/_/g, " ")}</Badge>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground capitalize">{section.content_type}</span>
            <span className="text-xs text-muted-foreground">•</span>
            <Badge variant="outline" className="text-[10px]">{getDisplayStyleLabel()}</Badge>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 max-w-32">
          {section.visible_tabs.slice(0, 3).map((tab) => (
            <Badge key={tab} variant="secondary" className="text-[10px]">{tab}</Badge>
          ))}
          {section.visible_tabs.length > 3 && (
            <Badge variant="secondary" className="text-[10px]">+{section.visible_tabs.length - 3}</Badge>
          )}
        </div>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" onClick={() => onEdit(section)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Section?</AlertDialogTitle>
                <AlertDialogDescription>This will remove "{section.title}" from all tabs.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(section.id)}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}

interface SelectedContent {
  id: string;
  title: string;
  content_type: string;
  thumbnail_url?: string;
}

export default function HomeSections() {
  const { sections, isLoading, createSection, updateSection, deleteSection, reorderSections } = useHomeSections();
  const { categories } = useCategories();
  const { movies } = useMoviesDB();
  const { webSeries } = useWebSeriesDB();
  const { tvShows } = useTVShowsDB();
  const { shortMovies } = useShortMoviesDB();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<HomeSection | null>(null);
  const [selectedContent, setSelectedContent] = useState<SelectedContent[]>([]);
  const [contentSearchType, setContentSearchType] = useState<string>("movies");
  
  const { items: sectionItems, addItem, removeItem } = useSectionItems(editingSection?.id || null);

  const [formData, setFormData] = useState<SectionFormData>({
    title: "",
    section_type: "trending_now",
    content_type: "all",
    content_source: "auto",
    category_id: undefined,
    display_style: "horizontal_banner",
    item_limit: 20,
    is_active: true,
    display_order: 0,
    visible_tabs: ["home"],
    trending_period_days: 7,
    is_original_only: false,
  });

  // Load existing section items when editing
  useEffect(() => {
    if (editingSection && sectionItems.length > 0) {
      const loadedContent: SelectedContent[] = sectionItems.map(item => {
        let content: any = null;
        switch (item.content_type) {
          case "movies": content = movies.find(m => m.id === item.content_id); break;
          case "web_series": content = webSeries.find(w => w.id === item.content_id); break;
          case "tv_shows": content = tvShows.find(t => t.id === item.content_id); break;
          case "short_movies": content = shortMovies.find(s => s.id === item.content_id); break;
        }
        return {
          id: item.content_id,
          title: content?.title || "Unknown",
          content_type: item.content_type,
          thumbnail_url: content?.thumbnail_url,
        };
      });
      setSelectedContent(loadedContent);
    }
  }, [editingSection, sectionItems, movies, webSeries, tvShows, shortMovies]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      const newOrder = arrayMove(sections, oldIndex, newIndex);
      reorderSections.mutate(newOrder.map((s) => s.id));
    }
  };

  const openCreateDialog = () => {
    setEditingSection(null);
    setSelectedContent([]);
    setFormData({
      title: "",
      section_type: "trending_now",
      content_type: "all",
      content_source: "auto",
      category_id: undefined,
      display_style: "horizontal_banner",
      item_limit: 20,
      is_active: true,
      display_order: sections.length,
      visible_tabs: ["home"],
      trending_period_days: 7,
      is_original_only: false,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (section: HomeSection) => {
    setEditingSection(section);
    setSelectedContent([]);
    setFormData({
      title: section.title,
      section_type: section.section_type,
      content_type: section.content_type,
      content_source: section.content_source,
      category_id: section.category_id || undefined,
      display_style: section.display_style,
      item_limit: section.item_limit || 20,
      is_active: section.is_active,
      display_order: section.display_order,
      visible_tabs: section.visible_tabs,
      trending_period_days: section.trending_period_days || 7,
      is_original_only: section.is_original_only || false,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title) return;

    const payload = {
      ...formData,
      category_id: formData.category_id || null,
    };

    let sectionId: string;

    if (editingSection) {
      await updateSection.mutateAsync({ id: editingSection.id, ...payload });
      sectionId = editingSection.id;
    } else {
      const result = await createSection.mutateAsync(payload);
      sectionId = result.id;
    }

    // Save selected content for admin_selected source
    if (formData.content_source === "admin_selected" && selectedContent.length > 0) {
      // Remove existing items if editing
      if (editingSection) {
        for (const item of sectionItems) {
          await removeItem.mutateAsync(item.id);
        }
      }
      // Add new items
      for (let i = 0; i < selectedContent.length; i++) {
        await addItem.mutateAsync({
          section_id: sectionId,
          content_type: selectedContent[i].content_type,
          content_id: selectedContent[i].id,
          display_order: i,
        });
      }
    }

    setDialogOpen(false);
  };

  const toggleTab = (tab: AppTab) => {
    setFormData((prev) => ({
      ...prev,
      visible_tabs: prev.visible_tabs.includes(tab)
        ? prev.visible_tabs.filter((t) => t !== tab)
        : [...prev.visible_tabs, tab],
    }));
  };

  const getContentList = () => {
    switch (contentSearchType) {
      case "movies": return movies.map(m => ({ ...m, content_type: "movies" }));
      case "web_series": return webSeries.map(w => ({ ...w, content_type: "web_series" }));
      case "tv_shows": return tvShows.map(t => ({ ...t, content_type: "tv_shows" }));
      case "short_movies": return shortMovies.map(s => ({ ...s, content_type: "short_movies" }));
      default: return [];
    }
  };

  const addContentToSelection = (item: any) => {
    if (!selectedContent.find(c => c.id === item.id)) {
      setSelectedContent([...selectedContent, {
        id: item.id,
        title: item.title,
        content_type: item.content_type,
        thumbnail_url: item.thumbnail_url,
      }]);
    }
  };

  const removeContentFromSelection = (id: string) => {
    setSelectedContent(selectedContent.filter(c => c.id !== id));
  };

  const getSectionDataAll = async ()=>{
    try{
      const res = await getSectionAPI()
      console.log(res,'reeees of section here ')
    }
    catch(error){
      console.log(error)
    }
  }
  useEffect(()=>{
getSectionDataAll()
  },[])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Section Builder</h1>
          <p className="text-sm text-muted-foreground">Build Netflix-style content sections for your home screen</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" /> Add Section
        </Button>
      </div>

      {/* Section Type Quick Add */}
      <div className="grid gap-3 md:grid-cols-4 lg:grid-cols-7">
        {SECTION_TYPES.map((type) => (
          <Card
            key={type.value}
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => {
              setEditingSection(null);
              setSelectedContent([]);
              setFormData({
                ...formData,
                title: type.label,
                section_type: type.value,
                display_order: sections.length,
              });
              setDialogOpen(true);
            }}
          >
            <CardContent className="p-3 text-center">
              <type.icon className="h-6 w-6 mx-auto mb-1 text-primary" />
              <p className="text-xs font-medium">{type.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sections List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Content Sections ({sections.length})</CardTitle>
          <CardDescription>Drag to reorder. Sections appear top-to-bottom on the app.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? (
            <p className="text-muted-foreground py-4">Loading...</p>
          ) : sections.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No sections yet. Add your first section!</p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                {sections.map((section) => (
                  <SortableSectionCard
                    key={section.id}
                    section={section}
                    onEdit={openEditDialog}
                    onDelete={(id) => deleteSection.mutate(id)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSection ? "Edit Section" : "Create New Section"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <Label>Section Title *</Label>
              <Input
                placeholder="Trending Now"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Section Type</Label>
                <Select
                  value={formData.section_type}
                  onValueChange={(v: SectionType) => setFormData({ ...formData, section_type: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover">
                    {SECTION_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Content Type</Label>
                <Select
                  value={formData.content_type}
                  onValueChange={(v) => setFormData({ ...formData, content_type: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover">
                    {CONTENT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Data Source</Label>
                <Select
                  value={formData.content_source}
                  onValueChange={(v: ContentSource) => setFormData({ ...formData, content_source: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover">
                    {CONTENT_SOURCES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Layout Style</Label>
                <Select
                  value={formData.display_style}
                  onValueChange={(v: DisplayStyle) => setFormData({ ...formData, display_style: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="horizontal_banner">
                      <div className="flex items-center gap-2">
                        <Rows3 className="h-4 w-4" />
                        <span>Horizontal Banner</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="vertical_banner">
                      <div className="flex items-center gap-2">
                        <LayoutGrid className="h-4 w-4" />
                        <span>Vertical Banner</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="big_horizontal">
                      <div className="flex items-center gap-2">
                        <Rows3 className="h-4 w-4" />
                        <span>Big Horizontal</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="big_vertical">
                      <div className="flex items-center gap-2">
                        <LayoutGrid className="h-4 w-4" />
                        <span>Big Vertical</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="index_horizontal">
                      <div className="flex items-center gap-2">
                        <List className="h-4 w-4" />
                        <span>Index Horizontal (1,2,3)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="index_vertical">
                      <div className="flex items-center gap-2">
                        <List className="h-4 w-4" />
                        <span>Index Vertical (1,2,3)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Manual Content Selection for Admin Selected */}
            {formData.content_source === "admin_selected" && (
              <div className="space-y-3">
                <Label>Select Content Manually</Label>
                
                {/* Content Type Selector */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={contentSearchType === "movies" ? "default" : "outline"}
                    onClick={() => setContentSearchType("movies")}
                  >
                    <Film className="h-3 w-3 mr-1" /> Movies
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={contentSearchType === "web_series" ? "default" : "outline"}
                    onClick={() => setContentSearchType("web_series")}
                  >
                    <Tv className="h-3 w-3 mr-1" /> Web Series
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={contentSearchType === "tv_shows" ? "default" : "outline"}
                    onClick={() => setContentSearchType("tv_shows")}
                  >
                    <Tv className="h-3 w-3 mr-1" /> TV Shows
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={contentSearchType === "short_movies" ? "default" : "outline"}
                    onClick={() => setContentSearchType("short_movies")}
                  >
                    <Film className="h-3 w-3 mr-1" /> Short Movies
                  </Button>
                </div>

                {/* Content List */}
                <div className="border rounded-lg">
                  <ScrollArea className="h-40">
                    <div className="p-2 space-y-1">
                      {getContentList().length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No content available</p>
                      ) : (
                        getContentList().map((item) => (
                          <div
                            key={item.id}
                            className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                              selectedContent.find(c => c.id === item.id)
                                ? "bg-primary/10 border border-primary/30"
                                : "hover:bg-muted"
                            }`}
                            onClick={() => addContentToSelection(item)}
                          >
                            {item.thumbnail_url ? (
                              <img src={item.thumbnail_url} alt="" className="h-8 w-12 rounded object-cover" />
                            ) : (
                              <div className="h-8 w-12 rounded bg-muted flex items-center justify-center">
                                <Film className="h-3 w-3 text-muted-foreground" />
                              </div>
                            )}
                            <span className="text-sm flex-1 truncate">{item.title}</span>
                            {selectedContent.find(c => c.id === item.id) && (
                              <Badge className="bg-primary text-xs">Added</Badge>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>

                {/* Selected Content */}
                {selectedContent.length > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">
                      Selected ({selectedContent.length})
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedContent.map((item) => (
                        <Badge key={item.id} variant="secondary" className="pr-1 flex items-center gap-1">
                          <span className="text-xs">{item.title}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0 hover:bg-destructive/20"
                            onClick={() => removeContentFromSelection(item.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {formData.section_type === "category_based" && (
              <div>
                <Label>Category</Label>
                <Select
                  value={formData.category_id || ""}
                  onValueChange={(v) => setFormData({ ...formData, category_id: v })}
                >
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent className="bg-popover">
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.section_type === "trending_now" && (
              <div>
                <Label>Trending Period (days)</Label>
                <Select
                  value={String(formData.trending_period_days)}
                  onValueChange={(v) => setFormData({ ...formData, trending_period_days: parseInt(v) })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="14">Last 14 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label>Item Limit</Label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={formData.item_limit}
                  onChange={(e) => setFormData({ ...formData, item_limit: parseInt(e.target.value) || 20 })}
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  checked={formData.is_original_only}
                  onCheckedChange={(v) => setFormData({ ...formData, is_original_only: v })}
                />
                <Label>Originals Only</Label>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                />
                <Label>Active</Label>
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Visible On Tabs</Label>
              <div className="flex flex-wrap gap-3">
                {TAB_OPTIONS.map((tab) => (
                  <label key={tab.value} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={formData.visible_tabs.includes(tab.value)}
                      onCheckedChange={() => toggleTab(tab.value)}
                    />
                    <span className="text-sm">{tab.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!formData.title}>
              {editingSection ? "Update Section" : "Create Section"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
