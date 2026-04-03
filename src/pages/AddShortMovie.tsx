import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  Video,
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
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { CastCrewAutocomplete } from "@/components/CastCrewAutocomplete";
import { useCastCrew } from "@/hooks/useCastCrew";
import { Person, roleLabels } from "@/lib/castCrewStore";
import { toast } from "sonner";
import { useShortMovies } from "@/hooks/useContent";

const genres = [
  "Drama", "Comedy", "Thriller", "Romance", "Sci-Fi", "Horror",
  "Documentary", "Animation", "Action", "Mystery", "Fantasy"
];

const languages = [
  "English", "Hindi", "Spanish", "French", "German", "Japanese",
  "Korean", "Chinese", "Tamil", "Telugu", "Bengali", "Marathi"
];

const ageRatings = ["U", "U/A 7+", "U/A 13+", "U/A 16+", "A (18+)"];

interface SelectedCrew {
  director?: Person;
  producer?: Person;
  writer?: Person;
  cinematographer?: Person;
  editor?: Person;
}

export default function AddShortMovie() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const { getShortMovie, addShortMovie, updateShortMovie } = useShortMovies();
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
  const [duration, setDuration] = useState("");
  const [ageRatingValue, setAgeRatingValue] = useState("");
  const [imdbRating, setImdbRating] = useState("");
  const [status, setStatus] = useState<"published" | "pending" | "draft">("draft");
  const [subscriptionRequired, setSubscriptionRequired] = useState(false);
  const [adsEnabled, setAdsEnabled] = useState(false);
  
  // Media upload states
  const [movieFile, setMovieFile] = useState<File | null>(null);
  const [trailerFile, setTrailerFile] = useState<File | null>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  // Load existing data in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const movie = getShortMovie(id);
      if (movie) {
        setTitle(movie.title);
        setTagline(movie.tagline || "");
        setDescription(movie.description || "");
        setLanguage(movie.language.toLowerCase());
        setDuration(movie.duration.replace(/[^\d]/g, ""));
        setImdbRating(movie.rating);
        setStatus(movie.status);
        setSubscriptionRequired(movie.subscriptionRequired);
        setAdsEnabled(movie.adsEnabled);
        setSelectedGenres(movie.genres || [movie.genre]);
        setTags(movie.tags || []);
        setPosterPreview(movie.thumbnail);
        if (movie.releaseDate) {
          setReleaseDate(parseISO(movie.releaseDate));
        }
        if (movie.ageRating) {
          setAgeRatingValue(movie.ageRating);
        }
        toast.success("Short movie data loaded for editing");
      } else {
        toast.error("Short movie not found");
        navigate("/short-movies");
      }
    }
  }, [isEditMode, id, getShortMovie, navigate]);

  const handleSave = () => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    const movieData = {
      title,
      tagline,
      description,
      genre: selectedGenres[0] || "Drama",
      genres: selectedGenres,
      language: language.charAt(0).toUpperCase() + language.slice(1),
      duration: `${duration}m`,
      rating: imdbRating || "0",
      status,
      subscriptionRequired,
      adsEnabled,
      thumbnail: posterPreview || "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&h=450&fit=crop",
      releaseDate: releaseDate ? releaseDate.toISOString() : undefined,
      ageRating: ageRatingValue,
      tags,
      director: selectedCrew.director?.name,
      views: 0,
    };

    if (isEditMode && id) {
      updateShortMovie(id, movieData);
      toast.success("Short movie updated successfully");
    } else {
      addShortMovie(movieData);
      toast.success("Short movie added successfully");
    }
    navigate("/short-movies");
  };

  const handleMovieUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMovieFile(file);
      toast.success(`Video file "${file.name}" uploaded successfully`);
    }
  };

  const handleTrailerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTrailerFile(file);
      toast.success(`Trailer "${file.name}" uploaded successfully`);
    }
  };

  const handlePosterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPosterFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPosterPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      toast.success(`Poster "${file.name}" uploaded successfully`);
    }
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      toast.success(`Thumbnail "${file.name}" uploaded successfully`);
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

  return (
    <div className="min-h-screen animate-fade-in pb-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/short-movies")}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight">
              {isEditMode ? "Edit Short Movie" : "Add Short Movie"}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {isEditMode ? "Update short film details" : "Add a new short film (under 30 minutes)"}
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
          <TabsList className="grid w-full min-w-[350px] grid-cols-4 gap-2 bg-transparent">
            <TabsTrigger
              value="basic"
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm"
            >
              <Video className="h-4 w-4" />
              <span className="hidden sm:inline">Basic Info</span>
              <span className="sm:hidden">Basic</span>
            </TabsTrigger>
            <TabsTrigger
              value="media"
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm"
            >
              <FileVideo className="h-4 w-4" />
              <span className="hidden sm:inline">Media</span>
              <span className="sm:hidden">Media</span>
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
                  Short Movie Details
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input 
                      id="title" 
                      placeholder="Enter short movie title" 
                      className="h-11" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input 
                      id="tagline" 
                      placeholder="A short catchy tagline" 
                      className="h-11" 
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
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
                  Video Metadata
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
                    <Label>Release Date</Label>
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
                    <Label htmlFor="duration">Duration (minutes) *</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="duration"
                        type="number"
                        max="30"
                        placeholder="15"
                        className="h-11 pl-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Max 30 minutes for short movies</p>
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
                  <div className="space-y-2 sm:col-span-2">
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
            </div>
          </div>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Video Upload */}
            <div className="glass-card rounded-xl p-4 sm:p-6">
              <h3 className="mb-4 font-display text-lg font-semibold">Video File *</h3>
              <input
                type="file"
                id="movie-file"
                accept="video/*"
                className="hidden"
                onChange={handleMovieUpload}
              />
              <div
                className="flex aspect-video cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/20 transition-colors hover:border-primary/50 hover:bg-secondary/40"
                onClick={() => document.getElementById('movie-file')?.click()}
              >
                {movieFile ? (
                  <div className="text-center p-4">
                    <FileVideo className="mx-auto h-12 w-12 text-primary" />
                    <p className="mt-2 font-medium text-sm">{movieFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(movieFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                    <Button variant="outline" size="sm" className="mt-3">
                      Change Video
                    </Button>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                    <p className="mt-2 text-sm font-medium">Upload Video File</p>
                    <p className="text-xs text-muted-foreground">
                      MP4, MOV, AVI (max 2GB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Trailer Upload */}
            <div className="glass-card rounded-xl p-4 sm:p-6">
              <h3 className="mb-4 font-display text-lg font-semibold">Trailer (Optional)</h3>
              <input
                type="file"
                id="trailer-file"
                accept="video/*"
                className="hidden"
                onChange={handleTrailerUpload}
              />
              <div
                className="flex aspect-video cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/20 transition-colors hover:border-primary/50 hover:bg-secondary/40"
                onClick={() => document.getElementById('trailer-file')?.click()}
              >
                {trailerFile ? (
                  <div className="text-center p-4">
                    <FileVideo className="mx-auto h-12 w-12 text-primary" />
                    <p className="mt-2 font-medium text-sm">{trailerFile.name}</p>
                    <Button variant="outline" size="sm" className="mt-3">
                      Change Trailer
                    </Button>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                    <p className="mt-2 text-sm font-medium">Upload Trailer</p>
                    <p className="text-xs text-muted-foreground">
                      30-60 seconds recommended
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Poster Upload */}
            <div className="glass-card rounded-xl p-4 sm:p-6">
              <h3 className="mb-4 font-display text-lg font-semibold">Poster Image *</h3>
              <input
                type="file"
                id="poster-file"
                accept="image/*"
                className="hidden"
                onChange={handlePosterUpload}
              />
              <div
                className="flex aspect-[2/3] cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/20 transition-colors hover:border-primary/50 hover:bg-secondary/40 overflow-hidden"
                onClick={() => document.getElementById('poster-file')?.click()}
              >
                {posterPreview ? (
                  <img src={posterPreview} alt="Poster" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground" />
                    <p className="mt-2 text-sm font-medium">Upload Poster</p>
                    <p className="text-xs text-muted-foreground">
                      300×450px recommended
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Upload */}
            <div className="glass-card rounded-xl p-4 sm:p-6">
              <h3 className="mb-4 font-display text-lg font-semibold">Thumbnail Image</h3>
              <input
                type="file"
                id="thumbnail-file"
                accept="image/*"
                className="hidden"
                onChange={handleThumbnailUpload}
              />
              <div
                className="flex aspect-video cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/20 transition-colors hover:border-primary/50 hover:bg-secondary/40 overflow-hidden"
                onClick={() => document.getElementById('thumbnail-file')?.click()}
              >
                {thumbnailPreview ? (
                  <img src={thumbnailPreview} alt="Thumbnail" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground" />
                    <p className="mt-2 text-sm font-medium">Upload Thumbnail</p>
                    <p className="text-xs text-muted-foreground">
                      1280×720px recommended
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
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
                {(["director", "producer", "writer", "cinematographer", "editor"] as const).map((role) => (
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
                  <Switch defaultChecked />
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
                    <Label>Featured Short</Label>
                    <p className="text-xs text-muted-foreground">
                      Show on shorts carousel
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Film Festival Entry</Label>
                    <p className="text-xs text-muted-foreground">
                      Mark as award-winning/festival selection
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
