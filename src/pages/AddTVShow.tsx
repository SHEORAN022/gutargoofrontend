import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  Clapperboard,
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
  ImageIcon,
  Tv,
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
import { format, parseISO } from "date-fns";
import { CastCrewAutocomplete } from "@/components/CastCrewAutocomplete";
import { useCastCrew } from "@/hooks/useCastCrew";
import { Person, roleLabels } from "@/lib/castCrewStore";
import { toast } from "sonner";
import { useTVShows } from "@/hooks/useContent";
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
  "Drama", "Comedy", "Crime", "Reality", "Game Show", "Talk Show",
  "Documentary", "News", "Sports", "Kids", "Music", "Lifestyle"
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
  airDate?: Date;
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
      className="flex flex-col sm:flex-row items-start gap-3 rounded-lg border border-border bg-secondary/20 p-3"
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
      <div className="flex-1 w-full grid gap-2 sm:grid-cols-3">
        <Input
          value={episode.title}
          onChange={(e) => onUpdate(seasonId, episode.id, 'title', e.target.value)}
          placeholder="Episode title"
          className="h-8 text-sm"
        />
        <Input
          value={episode.duration}
          onChange={(e) => onUpdate(seasonId, episode.id, 'duration', e.target.value)}
          placeholder="Duration (e.g., 22m)"
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
                <span className="truncate max-w-[60px]">{episode.videoFileName}</span>
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
          <div className="flex cursor-pointer items-center justify-between bg-secondary/30 px-3 sm:px-4 py-3 hover:bg-secondary/50">
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
                <h4 className="font-semibold text-sm sm:text-base">Season {season.seasonNumber}</h4>
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

export default function AddTVShow() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const { getTVShow, addTVShow, updateTVShow } = useTVShows();
  const { addPerson } = useCastCrew();
  const [activeTab, setActiveTab] = useState("basic");
  const [releaseDate, setReleaseDate] = useState<Date>();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [castMembers, setCastMembers] = useState<Person[]>([]);
  const [selectedCrew, setSelectedCrew] = useState<SelectedCrew>({});
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  
  // Form state
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("");
  const [channel, setChannel] = useState("");
  const [airTime, setAirTime] = useState("");
  const [ageRatingValue, setAgeRatingValue] = useState("");
  const [imdbRating, setImdbRating] = useState("");
  const [status, setStatus] = useState<"published" | "pending" | "draft">("draft");
  const [subscriptionRequired, setSubscriptionRequired] = useState(false);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  
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

  // Load existing data in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const show = getTVShow(id);
      if (show) {
        setTitle(show.title);
        setTagline(show.tagline || "");
        setDescription(show.description || "");
        setLanguage(show.language.toLowerCase());
        setChannel(show.channel || "");
        setAirTime(show.airTime || "");
        setImdbRating(show.rating);
        setStatus(show.status);
        setSubscriptionRequired(show.subscriptionRequired);
        setSelectedGenres(show.genres || [show.genre]);
        setTags(show.tags || []);
        setPosterPreview(show.thumbnail);
        if (show.releaseDate) {
          setReleaseDate(parseISO(show.releaseDate));
        }
        if (show.ageRating) {
          setAgeRatingValue(show.ageRating);
        }
        // Load seasons with proper structure
        if (show.seasons && show.seasons.length > 0) {
          setSeasons(show.seasons.map((s, idx) => ({
            id: s.id,
            seasonNumber: s.seasonNumber,
            title: s.title || `Season ${s.seasonNumber}`,
            description: s.description || "",
            isOpen: idx === 0,
            episodes: s.episodes.map(e => ({
              id: e.id,
              episodeNumber: e.episodeNumber,
              title: e.title,
              duration: e.duration,
              description: e.description || "",
              thumbnailPreview: e.thumbnailPreview,
              videoFileName: e.videoFileName,
            }))
          })));
        }
        toast.success("TV show data loaded for editing");
      } else {
        toast.error("TV show not found");
        navigate("/tv-shows");
      }
    }
  }, [isEditMode, id, getTVShow, navigate]);

  const handleSave = () => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    const totalEpisodes = seasons.reduce((acc, s) => acc + s.episodes.length, 0);

    const showData = {
      title,
      tagline,
      description,
      genre: selectedGenres[0] || "Drama",
      genres: selectedGenres,
      language: language.charAt(0).toUpperCase() + language.slice(1),
      rating: imdbRating || "0",
      status,
      subscriptionRequired,
      thumbnail: posterPreview || "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=300&h=450&fit=crop",
      releaseDate: releaseDate ? releaseDate.toISOString() : undefined,
      ageRating: ageRatingValue,
      tags,
      channel,
      airTime,
      seasons: seasons.map(s => ({
        id: s.id,
        seasonNumber: s.seasonNumber,
        title: s.title,
        description: s.description,
        episodes: s.episodes.map(e => ({
          id: e.id,
          title: e.title,
          duration: e.duration,
          episodeNumber: e.episodeNumber,
          description: e.description,
        }))
      })),
      totalEpisodes,
    };

    if (isEditMode && id) {
      updateTVShow(id, showData);
      toast.success("TV show updated successfully");
    } else {
      addTVShow(showData);
      toast.success("TV show added successfully");
    }
    navigate("/tv-shows");
  };

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

  // Episode Management
  const addEpisode = (seasonId: string) => {
    setSeasons(seasons.map(s => {
      if (s.id === seasonId) {
        const newEpNumber = s.episodes.length + 1;
        return {
          ...s,
          episodes: [...s.episodes, {
            id: `ep-${Date.now()}`,
            episodeNumber: newEpNumber,
            title: `Episode ${newEpNumber}`,
            description: "",
            duration: ""
          }]
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
        const filtered = s.episodes.filter(e => e.id !== episodeId);
        return {
          ...s,
          episodes: filtered.map((e, idx) => ({ ...e, episodeNumber: idx + 1 }))
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

  const handleVideoUpload = (seasonId: string, episodeId: string, file: File) => {
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
    toast.success(`Video uploaded for episode`);
  };

  const handleThumbnailUpload = (seasonId: string, episodeId: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setSeasons(seasons.map(s => {
        if (s.id === seasonId) {
          return {
            ...s,
            episodes: s.episodes.map(e => 
              e.id === episodeId ? { 
                ...e, 
                thumbnailFile: file, 
                thumbnailPreview: reader.result as string 
              } : e
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
    <div className="min-h-screen animate-fade-in pb-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/tv-shows")}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight">
              {isEditMode ? "Edit TV Show" : "Add New TV Show"}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {isEditMode ? "Update TV show details" : "Fill in all details to add a new TV show"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Preview</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => { setStatus("draft"); handleSave(); }}>
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">Save Draft</span>
          </Button>
          <Button size="sm" className="gap-2" onClick={() => { setStatus("published"); handleSave(); }}>
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">{isEditMode ? "Update" : "Publish"}</span>
          </Button>
        </div>
      </div>

      {/* Form Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="glass-card rounded-xl p-2 overflow-x-auto">
          <TabsList className="grid w-full min-w-[400px] grid-cols-4 gap-2 bg-transparent">
            <TabsTrigger
              value="basic"
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm"
            >
              <Clapperboard className="h-4 w-4" />
              <span className="hidden sm:inline">Basic Info</span>
              <span className="sm:hidden">Basic</span>
            </TabsTrigger>
            <TabsTrigger
              value="seasons"
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm"
            >
              <Tv className="h-4 w-4" />
              <span className="hidden sm:inline">Seasons</span>
              <span className="sm:hidden">Seasons</span>
            </TabsTrigger>
            <TabsTrigger
              value="cast"
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Cast & Crew</span>
              <span className="sm:hidden">Cast</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
              <span className="sm:hidden">Settings</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="glass-card rounded-xl p-4 sm:p-6">
                <h3 className="mb-4 font-display text-lg font-semibold">
                  Show Details
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Show Title *</Label>
                    <Input 
                      id="title" 
                      placeholder="Enter TV show title" 
                      className="h-11"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="channel">Channel / Network</Label>
                    <Input 
                      id="channel" 
                      placeholder="e.g., Star Plus, Sony TV" 
                      className="h-11"
                      value={channel}
                      onChange={(e) => setChannel(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="airTime">Air Time</Label>
                    <Input 
                      id="airTime" 
                      placeholder="e.g., Mon-Fri 8:00 PM" 
                      className="h-11"
                      value={airTime}
                      onChange={(e) => setAirTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Write a compelling description..."
                      className="min-h-[120px] resize-none"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-xl p-4 sm:p-6">
                <h3 className="mb-4 font-display text-lg font-semibold">
                  Genre & Categories
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Genres *</Label>
                    <div className="flex flex-wrap gap-2">
                      {genres.map((genre) => (
                        <Badge
                          key={genre}
                          variant="outline"
                          className={cn(
                            "cursor-pointer transition-all hover:bg-primary/20 text-xs",
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

            {/* Right Column */}
            <div className="space-y-6">
              <div className="glass-card rounded-xl p-4 sm:p-6">
                <h3 className="mb-4 font-display text-lg font-semibold">
                  Show Metadata
                </h3>
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
                    <Label>First Aired *</Label>
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
                      <Star className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-yellow-500" />
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

              {/* Thumbnail Upload */}
              <div className="glass-card rounded-xl p-4 sm:p-6">
                <h3 className="mb-4 font-display text-lg font-semibold">
                  Show Poster
                </h3>
                <div className="flex aspect-[2/3] cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/20 transition-colors hover:border-primary/50 hover:bg-secondary/40">
                  <div className="text-center p-4">
                    <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground" />
                    <p className="mt-2 text-sm font-medium">Upload Poster</p>
                    <p className="text-xs text-muted-foreground">
                      300×450px recommended
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Seasons & Episodes Tab */}
        <TabsContent value="seasons" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Manage Seasons & Episodes</h3>
            <Button onClick={addSeason} className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Season</span>
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
                    <div className="p-3 sm:p-4 space-y-3">
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(e) => handleEpisodeDragEnd(season.id, e)}
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
                                onVideoUpload={handleVideoUpload}
                                onThumbnailUpload={handleThumbnailUpload}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2"
                        onClick={() => addEpisode(season.id)}
                      >
                        <Plus className="h-4 w-4" />
                        Add Episode
                      </Button>
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
            <div className="glass-card rounded-xl p-4 sm:p-6">
              <h3 className="mb-4 font-display text-lg font-semibold">Cast Members</h3>
              <div className="space-y-4">
                <CastCrewAutocomplete
                  role="actor"
                  onSelect={addCastMember}
                  onAddNew={addNewCastMember}
                  placeholder="Search or add cast..."
                />
                {castMembers.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {castMembers.map((member) => (
                      <Badge key={member.id} variant="secondary" className="gap-2 py-1.5 pl-1.5">
                        <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                          {member.name.charAt(0)}
                        </div>
                        {member.name}
                        <button
                          onClick={() => removeCastMember(member.id)}
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

            <div className="glass-card rounded-xl p-4 sm:p-6">
              <h3 className="mb-4 font-display text-lg font-semibold">Crew Members</h3>
              <div className="space-y-4">
                {(["director", "producer", "writer"] as const).map((role) => (
                  <div key={role} className="space-y-2">
                    <Label className="capitalize">{roleLabels[role]}</Label>
                    {selectedCrew[role] ? (
                      <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/20 px-3 py-2">
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                          {selectedCrew[role]!.name.charAt(0)}
                        </div>
                        <span className="flex-1 text-sm">{selectedCrew[role]!.name}</span>
                        <button
                          onClick={() => removeCrewMember(role)}
                          className="rounded-full p-1 hover:bg-destructive/20"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <CastCrewAutocomplete
                        role={role}
                        onSelect={(person) => selectCrewMember(role, person)}
                        onAddNew={(name) => addNewCrewMember(role, name)}
                        placeholder={`Search ${roleLabels[role].toLowerCase()}...`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="glass-card rounded-xl p-4 sm:p-6">
              <h3 className="mb-4 font-display text-lg font-semibold">
                Visibility & Access
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Premium Content</Label>
                    <p className="text-xs text-muted-foreground">
                      Require subscription to watch
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Ads</Label>
                    <p className="text-xs text-muted-foreground">
                      Show ads for free users
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Downloads</Label>
                    <p className="text-xs text-muted-foreground">
                      Enable offline viewing
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>

            <div className="glass-card rounded-xl p-4 sm:p-6">
              <h3 className="mb-4 font-display text-lg font-semibold">
                Publish Status
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select defaultValue="draft">
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="pending">Pending Review</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Featured Show</Label>
                    <p className="text-xs text-muted-foreground">
                      Show on homepage banner
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
