import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  Tv,
  Save,
  Eye,
  X,
  Plus,
  Calendar,
  Clock,
  Star,
  Globe,
  Users,
  Settings,
  FileVideo,
  ChevronDown,
  ChevronUp,
  Trash2,
  GripVertical,
  User,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CastCrewAutocomplete } from "@/components/CastCrewAutocomplete";
import { useCastCrew } from "@/hooks/useCastCrew";
import { Person, roleLabels } from "@/lib/castCrewStore";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const genres = [
  "Action", "Adventure", "Animation", "Comedy", "Crime",
  "Documentary", "Drama", "Family", "Fantasy", "Horror",
  "Mystery", "Romance", "Sci-Fi", "Thriller", "War"
];

const languages = [
  "English", "Hindi", "Spanish", "French", "German", "Japanese",
  "Korean", "Chinese", "Tamil", "Telugu", "Bengali", "Marathi"
];

const ageRatings = ["U", "U/A 7+", "U/A 13+", "U/A 16+", "A (18+)"];

interface Episode {
  id: string;
  episodeNumber: number;
  title: string;
  description: string;
  duration: string;
  thumbnail?: string;
  thumbnailFile?: File | null;
  thumbnailPreview?: string;
  videoFile?: File | null;
  videoFileName?: string;
}

interface Season {
  id: string;
  seasonNumber: number;
  title: string;
  description: string;
  releaseDate?: Date;
  episodes: Episode[];
  isOpen: boolean;
}

// Sortable Episode Component
interface SortableEpisodeProps {
  episode: Episode;
  seasonId: string;
  onUpdate: (seasonId: string, episodeId: string, field: keyof Episode, value: any) => void;
  onRemove: (seasonId: string, episodeId: string) => void;
  onVideoUpload: (seasonId: string, episodeId: string, file: File) => void;
  onThumbnailUpload: (seasonId: string, episodeId: string, file: File) => void;
}

function SortableEpisode({ episode, seasonId, onUpdate, onRemove, onVideoUpload, onThumbnailUpload }: SortableEpisodeProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: episode.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-3 rounded-lg border border-border bg-secondary/20 p-3"
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex h-8 w-6 shrink-0 cursor-grab items-center justify-center text-muted-foreground hover:text-foreground active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Thumbnail */}
      <input
        type="file"
        id={`thumb-${episode.id}`}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            onThumbnailUpload(seasonId, episode.id, file);
          }
        }}
      />
      <div 
        className="relative h-14 w-20 shrink-0 cursor-pointer rounded-md border border-dashed border-border bg-secondary/50 overflow-hidden hover:border-primary/50 transition-colors"
        onClick={() => document.getElementById(`thumb-${episode.id}`)?.click()}
      >
        {episode.thumbnailPreview ? (
          <img 
            src={episode.thumbnailPreview} 
            alt={`Episode ${episode.episodeNumber} thumbnail`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground">
            <ImageIcon className="h-4 w-4 mb-0.5" />
            <span className="text-[8px]">Thumbnail</span>
          </div>
        )}
      </div>
      
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
        {episode.episodeNumber}
      </div>
      <div className="flex-1 grid gap-2 sm:grid-cols-3">
        <Input
          value={episode.title}
          onChange={(e) => onUpdate(seasonId, episode.id, 'title', e.target.value)}
          placeholder="Episode title"
          className="h-8 text-sm"
        />
        <Input
          value={episode.duration}
          onChange={(e) => onUpdate(seasonId, episode.id, 'duration', e.target.value)}
          placeholder="Duration (e.g., 45m)"
          className="h-8 text-sm"
        />
        <div className="flex gap-2">
          <input
            type="file"
            id={`video-${episode.id}`}
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onVideoUpload(seasonId, episode.id, file);
              }
            }}
          />
          <Button
            variant={episode.videoFileName ? "default" : "outline"}
            size="sm"
            className="h-8 flex-1 gap-1 text-xs"
            onClick={() => document.getElementById(`video-${episode.id}`)?.click()}
          >
            {episode.videoFileName ? (
              <>
                <FileVideo className="h-3 w-3" />
                {episode.videoFileName.length > 12 
                  ? episode.videoFileName.slice(0, 12) + '...' 
                  : episode.videoFileName}
              </>
            ) : (
              <>
                <Upload className="h-3 w-3" />
                Video
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
            onClick={() => onRemove(seasonId, episode.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Sortable Season Component
interface SortableSeasonProps {
  season: Season;
  children: React.ReactNode;
  onToggle: (seasonId: string) => void;
  onRemove: (seasonId: string) => void;
}

function SortableSeason({ season, children, onToggle, onRemove }: SortableSeasonProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: season.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Collapsible
      open={season.isOpen}
      onOpenChange={() => onToggle(season.id)}
      className="glass-card rounded-xl overflow-hidden"
    >
      <div ref={setNodeRef} style={style}>
        <CollapsibleTrigger asChild>
          <div className="flex cursor-pointer items-center justify-between bg-secondary/30 px-4 py-3 hover:bg-secondary/50">
            <div className="flex items-center gap-3">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-semibold">Season {season.seasonNumber}</h4>
                <p className="text-xs text-muted-foreground">
                  {season.episodes.length} Episode{season.episodes.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(season.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              {season.isOpen ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {children}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

interface SelectedCrew {
  director?: Person;
  producer?: Person;
  writer?: Person;
  music_director?: Person;
  cinematographer?: Person;
  editor?: Person;
}

export default function AddWebSeries() {
  const navigate = useNavigate();
  const { addPerson } = useCastCrew();
  const [activeTab, setActiveTab] = useState("basic");
  const [releaseDate, setReleaseDate] = useState<Date>();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [castMembers, setCastMembers] = useState<Person[]>([]);
  const [selectedCrew, setSelectedCrew] = useState<SelectedCrew>({});
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  
  // Seasons & Episodes state
  const [seasons, setSeasons] = useState<Season[]>([
    {
      id: "season-1",
      seasonNumber: 1,
      title: "Season 1",
      description: "",
      episodes: [
        { id: "ep-1-1", episodeNumber: 1, title: "Episode 1", description: "", duration: "" }
      ],
      isOpen: true,
    }
  ]);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle Season Drag End
  const handleSeasonDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = seasons.findIndex((s) => s.id === active.id);
      const newIndex = seasons.findIndex((s) => s.id === over.id);
      const newSeasons = arrayMove(seasons, oldIndex, newIndex).map((s, idx) => ({
        ...s,
        seasonNumber: idx + 1,
      }));
      setSeasons(newSeasons);
      toast.success("Season order updated");
    }
  };

  // Handle Episode Drag End
  const handleEpisodeDragEnd = (seasonId: string, event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSeasons(seasons.map(s => {
        if (s.id === seasonId) {
          const oldIndex = s.episodes.findIndex((e) => e.id === active.id);
          const newIndex = s.episodes.findIndex((e) => e.id === over.id);
          const newEpisodes = arrayMove(s.episodes, oldIndex, newIndex).map((e, idx) => ({
            ...e,
            episodeNumber: idx + 1,
          }));
          return { ...s, episodes: newEpisodes };
        }
        return s;
      }));
      toast.success("Episode order updated");
    }
  };

  const addCastMember = (person: Person) => {
    if (!castMembers.find(m => m.id === person.id)) {
      setCastMembers([...castMembers, person]);
    }
  };

  const addNewCastMember = (name: string) => {
    const newPerson = addPerson({ name, roles: ["actor"] });
    setCastMembers([...castMembers, newPerson]);
    toast.success(`"${name}" added to Cast & Crew database`);
  };

  const removeCastMember = (id: string) => {
    setCastMembers(castMembers.filter((m) => m.id !== id));
  };

  const selectCrewMember = (role: keyof SelectedCrew, person: Person) => {
    setSelectedCrew({ ...selectedCrew, [role]: person });
  };

  const addNewCrewMember = (role: keyof SelectedCrew, name: string) => {
    const newPerson = addPerson({ name, roles: [role] });
    setSelectedCrew({ ...selectedCrew, [role]: newPerson });
    toast.success(`"${name}" added to Cast & Crew database`);
  };

  const removeCrewMember = (role: keyof SelectedCrew) => {
    const updated = { ...selectedCrew };
    delete updated[role];
    setSelectedCrew(updated);
  };

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const addTag = () => {
    if (newTag.trim()) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  // Season Management
  const addSeason = () => {
    const newSeasonNumber = seasons.length + 1;
    setSeasons([
      ...seasons,
      {
        id: `season-${Date.now()}`,
        seasonNumber: newSeasonNumber,
        title: `Season ${newSeasonNumber}`,
        description: "",
        episodes: [
          { id: `ep-${Date.now()}`, episodeNumber: 1, title: "Episode 1", description: "", duration: "" }
        ],
        isOpen: true,
      }
    ]);
    toast.success(`Season ${newSeasonNumber} added`);
  };

  const removeSeason = (seasonId: string) => {
    if (seasons.length === 1) {
      toast.error("At least one season is required");
      return;
    }
    setSeasons(seasons.filter(s => s.id !== seasonId));
    toast.success("Season removed");
  };

  const toggleSeasonOpen = (seasonId: string) => {
    setSeasons(seasons.map(s => 
      s.id === seasonId ? { ...s, isOpen: !s.isOpen } : s
    ));
  };

  const updateSeason = (seasonId: string, field: keyof Season, value: any) => {
    setSeasons(seasons.map(s => 
      s.id === seasonId ? { ...s, [field]: value } : s
    ));
  };

  // Episode Management
  const addEpisode = (seasonId: string) => {
    setSeasons(seasons.map(s => {
      if (s.id === seasonId) {
        const newEpNumber = s.episodes.length + 1;
        return {
          ...s,
          episodes: [
            ...s.episodes,
            { id: `ep-${Date.now()}`, episodeNumber: newEpNumber, title: `Episode ${newEpNumber}`, description: "", duration: "" }
          ]
        };
      }
      return s;
    }));
  };

  const removeEpisode = (seasonId: string, episodeId: string) => {
    setSeasons(seasons.map(s => {
      if (s.id === seasonId) {
        if (s.episodes.length === 1) {
          toast.error("At least one episode is required per season");
          return s;
        }
        return {
          ...s,
          episodes: s.episodes.filter(e => e.id !== episodeId)
        };
      }
      return s;
    }));
  };

  const updateEpisode = (seasonId: string, episodeId: string, field: keyof Episode, value: any) => {
    setSeasons(seasons.map(s => {
      if (s.id === seasonId) {
        return {
          ...s,
          episodes: s.episodes.map(e => 
            e.id === episodeId ? { ...e, [field]: value } : e
          )
        };
      }
      return s;
    }));
  };

  const handleEpisodeVideoUpload = (seasonId: string, episodeId: string, file: File) => {
    setSeasons(seasons.map(s => {
      if (s.id === seasonId) {
        return {
          ...s,
          episodes: s.episodes.map(e => 
            e.id === episodeId ? { ...e, videoFile: file, videoFileName: file.name } : e
          )
        };
      }
      return s;
    }));
    toast.success(`Video "${file.name}" uploaded for episode`);
  };

  const handleEpisodeThumbnailUpload = (seasonId: string, episodeId: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setSeasons(seasons.map(s => {
        if (s.id === seasonId) {
          return {
            ...s,
            episodes: s.episodes.map(e => 
              e.id === episodeId ? { ...e, thumbnailFile: file, thumbnailPreview: reader.result as string } : e
            )
          };
        }
        return s;
      }));
    };
    reader.readAsDataURL(file);
    toast.success(`Thumbnail uploaded for episode`);
  };

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/web-series")}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">
              Add New Web Series
            </h1>
            <p className="text-sm text-muted-foreground">
              Create a new web series with seasons and episodes
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button variant="outline" className="gap-2">
            <Save className="h-4 w-4" />
            Save Draft
          </Button>
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            Publish
          </Button>
        </div>
      </div>

      {/* Form Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="glass-card rounded-xl p-2">
          <TabsList className="grid w-full grid-cols-2 gap-2 bg-transparent md:grid-cols-5">
            <TabsTrigger
              value="basic"
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Tv className="h-4 w-4" />
              <span className="hidden sm:inline">Basic Info</span>
            </TabsTrigger>
            <TabsTrigger
              value="seasons"
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <FileVideo className="h-4 w-4" />
              <span className="hidden sm:inline">Seasons & Episodes</span>
            </TabsTrigger>
            <TabsTrigger
              value="cast"
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Cast & Crew</span>
            </TabsTrigger>
            <TabsTrigger
              value="media"
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Media</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="glass-card rounded-xl p-6">
                <h3 className="mb-4 font-display text-lg font-semibold">Series Details</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Series Title *</Label>
                    <Input id="title" placeholder="Enter series title" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input id="tagline" placeholder="A short catchy tagline" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Write a compelling description..."
                      className="min-h-[120px] resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-xl p-6">
                <h3 className="mb-4 font-display text-lg font-semibold">Genre & Tags</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Genres *</Label>
                    <div className="flex flex-wrap gap-2">
                      {genres.map((genre) => (
                        <Badge
                          key={genre}
                          variant="outline"
                          className={cn(
                            "cursor-pointer transition-all hover:bg-primary/20",
                            selectedGenres.includes(genre) &&
                              "border-primary bg-primary/20 text-primary"
                          )}
                          onClick={() => toggleGenre(genre)}
                        >
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Tags / Keywords</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a tag"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addTag()}
                        className="h-10"
                      />
                      <Button onClick={addTag} size="icon" className="shrink-0">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="gap-1 pr-1">
                            {tag}
                            <button
                              onClick={() => removeTag(index)}
                              className="ml-1 rounded-full p-0.5 hover:bg-destructive/20"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="glass-card rounded-xl p-6">
                <h3 className="mb-4 font-display text-lg font-semibold">Metadata</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Language *</Label>
                    <Select>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {languages.map((lang) => (
                          <SelectItem key={lang} value={lang.toLowerCase()}>
                            {lang}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>First Air Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "h-11 w-full justify-start text-left font-normal",
                            !releaseDate && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {releaseDate ? format(releaseDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-popover" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={releaseDate}
                          onSelect={setReleaseDate}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Age Rating *</Label>
                    <Select>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select rating" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {ageRatings.map((rating) => (
                          <SelectItem key={rating} value={rating}>
                            {rating}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="imdb">IMDB Rating</Label>
                    <div className="relative">
                      <Star className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-warning" />
                      <Input
                        id="imdb"
                        type="number"
                        step="0.1"
                        max="10"
                        placeholder="8.5"
                        className="h-11 pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-xl p-6">
                <h3 className="mb-4 font-display text-lg font-semibold">Production</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="studio">Production Studio</Label>
                    <Input id="studio" placeholder="e.g., Netflix, HBO" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country of Origin</Label>
                    <Input id="country" placeholder="e.g., United States, India" className="h-11" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Seasons & Episodes Tab */}
        <TabsContent value="seasons" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold">Seasons & Episodes</h3>
              <p className="text-sm text-muted-foreground">
                Drag to reorder seasons and episodes
              </p>
            </div>
            <Button onClick={addSeason} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Season
            </Button>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleSeasonDragEnd}
          >
            <SortableContext
              items={seasons.map(s => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {seasons.map((season) => (
                  <SortableSeason
                    key={season.id}
                    season={season}
                    onToggle={toggleSeasonOpen}
                    onRemove={removeSeason}
                  >
                    <div className="p-4 space-y-4">
                      {/* Season Details */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Season Title</Label>
                          <Input
                            value={season.title}
                            onChange={(e) => updateSeason(season.id, 'title', e.target.value)}
                            placeholder="Season title"
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Release Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "h-10 w-full justify-start text-left font-normal",
                                  !season.releaseDate && "text-muted-foreground"
                                )}
                              >
                                <Calendar className="mr-2 h-4 w-4" />
                                {season.releaseDate ? format(season.releaseDate, "PPP") : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-popover" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={season.releaseDate}
                                onSelect={(date) => updateSeason(season.id, 'releaseDate', date)}
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      {/* Episodes */}
                      <div>
                        <div className="mb-3 flex items-center justify-between">
                          <Label>Episodes (drag to reorder)</Label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addEpisode(season.id)}
                            className="gap-1 h-8"
                          >
                            <Plus className="h-3 w-3" />
                            Add Episode
                          </Button>
                        </div>
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={(event) => handleEpisodeDragEnd(season.id, event)}
                        >
                          <SortableContext
                            items={season.episodes.map(e => e.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className="space-y-2">
                              {season.episodes.map((episode) => (
                                <SortableEpisode
                                  key={episode.id}
                                  episode={episode}
                                  seasonId={season.id}
                                  onUpdate={updateEpisode}
                                  onRemove={removeEpisode}
                                  onVideoUpload={handleEpisodeVideoUpload}
                                  onThumbnailUpload={handleEpisodeThumbnailUpload}
                                />
                              ))}
                            </div>
                          </SortableContext>
                        </DndContext>
                      </div>
                    </div>
                  </SortableSeason>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </TabsContent>

        {/* Cast & Crew Tab */}
        <TabsContent value="cast" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="glass-card rounded-xl p-6">
              <h3 className="mb-4 font-display text-lg font-semibold">Director & Key Crew</h3>
              <div className="space-y-4">
                {(["director", "producer", "writer", "music_director", "cinematographer", "editor"] as const).map((role) => (
                  <div key={role} className="space-y-2">
                    <Label>{roleLabels[role]} {role === "director" ? "*" : ""}</Label>
                    {selectedCrew[role] ? (
                      <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3">
                        <div className="flex items-center gap-3">
                          {selectedCrew[role]!.image ? (
                            <img
                              src={selectedCrew[role]!.image}
                              alt={selectedCrew[role]!.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                              <User className="h-5 w-5" />
                            </div>
                          )}
                          <span className="font-medium">{selectedCrew[role]!.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => removeCrewMember(role)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <CastCrewAutocomplete
                        role={role}
                        placeholder={`Search or add ${roleLabels[role].toLowerCase()}...`}
                        onSelect={(person) => selectCrewMember(role, person)}
                        onAddNew={(name) => addNewCrewMember(role, name)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-xl p-6">
              <h3 className="mb-4 font-display text-lg font-semibold">Cast Members</h3>
              <div className="space-y-4">
                <CastCrewAutocomplete
                  role="actor"
                  placeholder="Search or add cast member..."
                  onSelect={addCastMember}
                  onAddNew={addNewCastMember}
                  selectedIds={castMembers.map(m => m.id)}
                />
                {castMembers.length > 0 ? (
                  <div className="space-y-2">
                    {castMembers.map((member, index) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          {member.image ? (
                            <img
                              src={member.image}
                              alt={member.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                              {index + 1}
                            </div>
                          )}
                          <span className="font-medium">{member.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => removeCastMember(member.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-border py-8 text-center">
                    <Users className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No cast members added yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="glass-card rounded-xl p-6">
              <h3 className="mb-4 font-display text-lg font-semibold">Poster & Banners</h3>
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Horizontal Banner (16:9)</Label>
                  <div className="flex aspect-video cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/30 transition-colors hover:border-primary/50">
                    <div className="text-center">
                      <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Click to upload</p>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block">Vertical Poster (2:3)</Label>
                  <div className="flex aspect-[2/3] max-w-[200px] cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/30 transition-colors hover:border-primary/50">
                    <div className="text-center">
                      <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Upload</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-xl p-6">
              <h3 className="mb-4 font-display text-lg font-semibold">Trailer</h3>
              <div className="rounded-xl border-2 border-dashed border-border bg-secondary/30 p-8 text-center transition-colors hover:border-primary/50">
                <FileVideo className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h4 className="mb-2 font-semibold">Upload Trailer</h4>
                <p className="mb-4 text-sm text-muted-foreground">
                  MP4, MOV, MKV • Max 500MB
                </p>
                <Button className="gap-2">
                  <Upload className="h-4 w-4" />
                  Choose File
                </Button>
              </div>
              <div className="mt-4 space-y-2">
                <Label>Or paste YouTube/Vimeo URL</Label>
                <Input placeholder="https://youtube.com/watch?v=..." className="h-10" />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="glass-card rounded-xl p-6">
              <h3 className="mb-4 font-display text-lg font-semibold">Visibility & Access</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Publish Status</Label>
                    <p className="text-sm text-muted-foreground">Make visible to users</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Subscription Required</Label>
                    <p className="text-sm text-muted-foreground">Premium only content</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Enable Ads</Label>
                    <p className="text-sm text-muted-foreground">Show ads during playback</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Allow Downloads</Label>
                    <p className="text-sm text-muted-foreground">Offline viewing</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Featured Series</Label>
                    <p className="text-sm text-muted-foreground">Show on homepage</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>

            <div className="glass-card rounded-xl p-6">
              <h3 className="mb-4 font-display text-lg font-semibold">Audio & Subtitles</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Available Audio Tracks</Label>
                  <div className="flex flex-wrap gap-2">
                    {["English", "Hindi", "Tamil", "Telugu"].map((lang) => (
                      <Badge key={lang} variant="outline" className="cursor-pointer hover:bg-primary/20">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Subtitle Languages</Label>
                  <div className="flex flex-wrap gap-2">
                    {["English", "Hindi", "Spanish", "French"].map((lang) => (
                      <Badge key={lang} variant="outline" className="cursor-pointer hover:bg-primary/20">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
