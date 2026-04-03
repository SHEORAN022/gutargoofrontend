import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  Film,
  Image,
  Play,
  Save,
  Eye,
  X,
  Plus,
  Calendar,
  Clock,
  Star,
  Globe,
  Users,
  Tag,
  Settings,
  FileVideo,
  ImageIcon,
  User,
  Loader2,
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
import { VendorSelect } from "@/components/VendorSelect";
import { useCastCrew } from "@/hooks/useCastCrew";
import { Person, roleLabels } from "@/lib/castCrewStore";
import { toast } from "sonner";
import { useMoviesDB } from "@/hooks/useMoviesDB";

const genres = [
  "Action", "Adventure", "Animation", "Biography", "Comedy", "Crime",
  "Documentary", "Drama", "Family", "Fantasy", "History", "Horror",
  "Music", "Mystery", "Romance", "Sci-Fi", "Sport", "Thriller", "War", "Western"
];

const languages = [
  "English", "Hindi", "Spanish", "French", "German", "Japanese",
  "Korean", "Chinese", "Tamil", "Telugu", "Bengali", "Marathi"
];

const ageRatings = ["U", "U/A 7+", "U/A 13+", "U/A 16+", "A (18+)"];

const audioFormats = ["Stereo", "5.1 Surround", "7.1 Surround", "Dolby Atmos", "DTS"];

interface SelectedCrew {
  director?: Person;
  producer?: Person;
  writer?: Person;
  music_director?: Person;
  cinematographer?: Person;
  editor?: Person;
}

export default function AddMovie() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const { getMovie, addMovie, updateMovie } = useMoviesDB();
  const { addPerson } = useCastCrew();
  const [activeTab, setActiveTab] = useState("basic");
  const [releaseDate, setReleaseDate] = useState<Date>();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [castMembers, setCastMembers] = useState<Person[]>([]);
  const [selectedCrew, setSelectedCrew] = useState<SelectedCrew>({});
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [subtitleLanguages, setSubtitleLanguages] = useState<string[]>([]);
  const [audioTracks, setAudioTracks] = useState<string[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [storyline, setStoryline] = useState("");
  const [language, setLanguage] = useState("");
  const [duration, setDuration] = useState("");
  const [ageRating, setAgeRating] = useState("");
  const [imdbRating, setImdbRating] = useState("");
  const [year, setYear] = useState("");
  const [status, setStatus] = useState<"published" | "pending" | "draft">("draft");
  const [subscriptionRequired, setSubscriptionRequired] = useState(false);
  const [adsEnabled, setAdsEnabled] = useState(false);
  const [vendorId, setVendorId] = useState<string | null>(null);
  
  // Media upload states
  const [movieFile, setMovieFile] = useState<File | null>(null);
  const [trailerFile, setTrailerFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);

  // Load existing data in edit mode
  useEffect(() => {
    const loadMovie = async () => {
      if (isEditMode && id) {
        setIsLoadingData(true);
        const movie = await getMovie(id);
        if (movie) {
          setTitle(movie.title);
          setTagline(movie.tagline || "");
          setDescription(movie.description || "");
          setLanguage(movie.language.toLowerCase());
          setDuration(movie.duration?.replace(/[^\d]/g, "") || "");
          setImdbRating(movie.rating || "");
          setStatus(movie.status);
          setSubscriptionRequired(movie.subscription_required);
          setAdsEnabled(movie.ads_enabled);
          setSelectedGenres(movie.genres || [movie.genre]);
          setTags(movie.tags || []);
          setPosterPreview(movie.thumbnail_url);
          setVendorId(movie.vendor_id);
          if (movie.release_date) {
            setReleaseDate(parseISO(movie.release_date));
          }
          if (movie.age_rating) {
            setAgeRating(movie.age_rating);
          }
          toast.success("Movie data loaded for editing");
        } else {
          toast.error("Movie not found");
          navigate("/movies");
        }
        setIsLoadingData(false);
      }
    };
    loadMovie();
  }, [isEditMode, id, getMovie, navigate]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Please enter a movie title");
      return;
    }

    setIsSaving(true);
    const movieData = {
      title,
      tagline,
      description,
      genre: selectedGenres[0] || "Drama",
      genres: selectedGenres,
      language: language ? language.charAt(0).toUpperCase() + language.slice(1) : "Hindi",
      duration: duration ? `${duration}m` : null,
      rating: imdbRating || null,
      status,
      subscription_required: subscriptionRequired,
      ads_enabled: adsEnabled,
      thumbnail_url: posterPreview || null,
      video_url: null,
      release_date: releaseDate ? releaseDate.toISOString().split("T")[0] : null,
      age_rating: ageRating || null,
      tags,
      cast_crew: [],
      vendor_id: vendorId,
    };

    if (isEditMode && id) {
      const success = await updateMovie(id, movieData);
      if (success) {
        toast.success("Movie updated successfully");
        navigate("/movies");
      }
    } else {
      const result = await addMovie(movieData);
      if (result) {
        toast.success("Movie added successfully");
        navigate("/movies");
      }
    }
    setIsSaving(false);
  };

  const handleMovieUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMovieFile(file);
      toast.success(`Movie file "${file.name}" uploaded successfully`);
    }
  };

  const handleTrailerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTrailerFile(file);
      toast.success(`Trailer "${file.name}" uploaded successfully`);
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      toast.success(`Banner "${file.name}" uploaded successfully`);
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

  const addTag = () => {
    if (newTag.trim()) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/movies")}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">
              {isEditMode ? "Edit Movie" : "Add New Movie"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEditMode ? "Update movie details" : "Fill in all details to add a new movie to the platform"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" disabled={isSaving}>
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => { setStatus("draft"); handleSave(); }} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Draft
          </Button>
          <Button className="gap-2" onClick={() => { setStatus("published"); handleSave(); }} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {isEditMode ? "Update" : "Publish"}
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
              <Film className="h-4 w-4" />
              <span className="hidden sm:inline">Basic Info</span>
            </TabsTrigger>
            <TabsTrigger
              value="media"
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <FileVideo className="h-4 w-4" />
              <span className="hidden sm:inline">Media</span>
            </TabsTrigger>
            <TabsTrigger
              value="cast"
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Cast & Crew</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
            <TabsTrigger
              value="seo"
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">SEO</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="glass-card rounded-xl p-6">
                <h3 className="mb-4 font-display text-lg font-semibold">
                  Movie Details
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Movie Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter movie title"
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
                      placeholder="Write a compelling description of the movie..."
                      className="min-h-[150px] resize-none"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storyline">Full Storyline</Label>
                    <Textarea
                      id="storyline"
                      placeholder="Detailed storyline without spoilers..."
                      className="min-h-[100px] resize-none"
                      value={storyline}
                      onChange={(e) => setStoryline(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-xl p-6">
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
                          <Badge
                            key={index}
                            variant="secondary"
                            className="gap-1 pr-1"
                          >
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
              <div className="glass-card rounded-xl p-6">
                <h3 className="mb-4 font-display text-lg font-semibold">
                  Movie Metadata
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Language *</Label>
                    <Select value={language} onValueChange={setLanguage}>
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
                    <Label>Release Date *</Label>
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
                          {releaseDate
                            ? format(releaseDate, "PPP")
                            : "Pick a date"}
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
                        placeholder="120"
                        className="h-11 pl-10"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                      />
                    </div>
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
                  <div className="space-y-2">
                    <Label htmlFor="year">Release Year *</Label>
                    <Input
                      id="year"
                      type="number"
                      placeholder="2024"
                      className="h-11"
                    />
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-xl p-6">
                <h3 className="mb-4 font-display text-lg font-semibold">
                  Production Details
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="studio">Production Studio</Label>
                    <Input
                      id="studio"
                      placeholder="e.g., Warner Bros, Universal"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country of Origin</Label>
                    <Input
                      id="country"
                      placeholder="e.g., United States, India"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget (Optional)</Label>
                    <Input
                      id="budget"
                      placeholder="e.g., ₹150 Crore"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="awards">Awards & Nominations</Label>
                    <Textarea
                      id="awards"
                      placeholder="List any awards or nominations..."
                      className="min-h-[80px] resize-none"
                    />
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
            <div className="glass-card rounded-xl p-6">
              <h3 className="mb-4 font-display text-lg font-semibold">
                Video File *
              </h3>
              <input
                type="file"
                id="movie-file"
                accept="video/*"
                className="hidden"
                onChange={handleMovieUpload}
              />
              <div 
                className="cursor-pointer rounded-xl border-2 border-dashed border-border bg-secondary/30 p-8 text-center transition-colors hover:border-primary/50 hover:bg-secondary/50"
                onClick={() => document.getElementById('movie-file')?.click()}
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <FileVideo className="h-8 w-8 text-primary" />
                </div>
                {movieFile ? (
                  <>
                    <h4 className="mb-2 font-semibold text-primary">File Uploaded</h4>
                    <p className="mb-4 text-sm text-muted-foreground">
                      {movieFile.name}
                    </p>
                    <p className="mb-4 text-xs text-muted-foreground">
                      Size: {(movieFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </>
                ) : (
                  <>
                    <h4 className="mb-2 font-semibold">Upload Movie File</h4>
                    <p className="mb-4 text-sm text-muted-foreground">
                      Supported formats: MP4, MOV, MKV, AVI
                    </p>
                    <p className="mb-4 text-xs text-muted-foreground">
                      Maximum file size: 10GB • Recommended: 1080p or 4K
                    </p>
                  </>
                )}
                <Button className="gap-2">
                  <Upload className="h-4 w-4" />
                  {movieFile ? 'Change File' : 'Choose File'}
                </Button>
              </div>
              <div className="mt-4 space-y-3">
                <div className="space-y-2">
                  <Label>Video Quality</Label>
                  <Select>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="4k">4K Ultra HD (2160p)</SelectItem>
                      <SelectItem value="1080p">Full HD (1080p)</SelectItem>
                      <SelectItem value="720p">HD (720p)</SelectItem>
                      <SelectItem value="480p">SD (480p)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Audio Format</Label>
                  <Select>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select audio format" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {audioFormats.map((format) => (
                        <SelectItem key={format} value={format.toLowerCase()}>
                          {format}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Trailer */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="mb-4 font-display text-lg font-semibold">
                Trailer
              </h3>
              <input
                type="file"
                id="trailer-file"
                accept="video/*"
                className="hidden"
                onChange={handleTrailerUpload}
              />
              <div 
                className="cursor-pointer rounded-xl border-2 border-dashed border-border bg-secondary/30 p-8 text-center transition-colors hover:border-primary/50 hover:bg-secondary/50"
                onClick={() => document.getElementById('trailer-file')?.click()}
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                  <Play className="h-8 w-8 text-accent" />
                </div>
                {trailerFile ? (
                  <>
                    <h4 className="mb-2 font-semibold text-accent">Trailer Uploaded</h4>
                    <p className="mb-4 text-sm text-muted-foreground">
                      {trailerFile.name}
                    </p>
                  </>
                ) : (
                  <>
                    <h4 className="mb-2 font-semibold">Upload Trailer</h4>
                    <p className="mb-4 text-sm text-muted-foreground">
                      Upload trailer video or add YouTube URL
                    </p>
                  </>
                )}
                <Button variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" />
                  {trailerFile ? 'Change Trailer' : 'Upload Trailer'}
                </Button>
              </div>
              <div className="mt-4 space-y-2">
                <Label htmlFor="trailerUrl">Or Enter YouTube/Vimeo URL</Label>
                <Input
                  id="trailerUrl"
                  placeholder="https://youtube.com/watch?v=..."
                  className="h-11"
                />
              </div>
            </div>

            {/* Horizontal Banner */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="mb-4 font-display text-lg font-semibold">
                Horizontal Banner (16:9) *
              </h3>
              <input
                type="file"
                id="banner-file"
                accept="image/*"
                className="hidden"
                onChange={handleBannerUpload}
              />
              <div 
                className="cursor-pointer aspect-video rounded-xl border-2 border-dashed border-border bg-secondary/30 p-8 text-center transition-colors hover:border-primary/50 hover:bg-secondary/50 overflow-hidden"
                onClick={() => document.getElementById('banner-file')?.click()}
              >
                {bannerPreview ? (
                  <img src={bannerPreview} alt="Banner preview" className="w-full h-full object-cover rounded-lg -m-8" style={{ width: 'calc(100% + 4rem)', height: 'calc(100% + 4rem)' }} />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-info/10">
                      <ImageIcon className="h-6 w-6 text-info" />
                    </div>
                    <h4 className="mb-1 font-semibold">Horizontal Banner</h4>
                    <p className="mb-3 text-xs text-muted-foreground">
                      Recommended: 1920x1080px • JPG, PNG, WebP
                    </p>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Upload className="h-3 w-3" />
                      Upload
                    </Button>
                  </div>
                )}
              </div>
              {bannerFile && (
                <p className="mt-2 text-sm text-muted-foreground text-center">{bannerFile.name}</p>
              )}
            </div>

            {/* Vertical Poster */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="mb-4 font-display text-lg font-semibold">
                Vertical Poster (2:3) *
              </h3>
              <input
                type="file"
                id="poster-file"
                accept="image/*"
                className="hidden"
                onChange={handlePosterUpload}
              />
              <div 
                className="cursor-pointer mx-auto aspect-[2/3] max-w-[250px] rounded-xl border-2 border-dashed border-border bg-secondary/30 p-6 text-center transition-colors hover:border-primary/50 hover:bg-secondary/50 overflow-hidden"
                onClick={() => document.getElementById('poster-file')?.click()}
              >
                {posterPreview ? (
                  <img src={posterPreview} alt="Poster preview" className="w-full h-full object-cover rounded-lg -m-6" style={{ width: 'calc(100% + 3rem)', height: 'calc(100% + 3rem)' }} />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                      <Image className="h-6 w-6 text-success" />
                    </div>
                    <h4 className="mb-1 text-sm font-semibold">Vertical Poster</h4>
                    <p className="mb-3 text-xs text-muted-foreground">
                      Recommended: 800x1200px
                    </p>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Upload className="h-3 w-3" />
                      Upload
                    </Button>
                  </div>
                )}
              </div>
              {posterFile && (
                <p className="mt-2 text-sm text-muted-foreground text-center">{posterFile.name}</p>
              )}
            </div>

            {/* Additional Images */}
            <div className="glass-card rounded-xl p-6 lg:col-span-2">
              <h3 className="mb-4 font-display text-lg font-semibold">
                Screenshots & Gallery
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Add movie stills, behind-the-scenes, and promotional images
              </p>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="aspect-video rounded-lg border-2 border-dashed border-border bg-secondary/30 p-4 text-center transition-colors hover:border-primary/50"
                  >
                    <div className="flex h-full flex-col items-center justify-center">
                      <Plus className="mb-2 h-6 w-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Add Image</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Cast & Crew Tab */}
        <TabsContent value="cast" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="glass-card rounded-xl p-6">
              <h3 className="mb-4 font-display text-lg font-semibold">
                Director & Key Crew
              </h3>
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
              <h3 className="mb-4 font-display text-lg font-semibold">
                Cast Members
              </h3>
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
                    <p className="text-sm text-muted-foreground">
                      No cast members added yet
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Search existing or add new cast members
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Vendor Selection */}
            <div className="glass-card rounded-xl p-6 lg:col-span-2">
              <h3 className="mb-4 font-display text-lg font-semibold">
                Content Source
              </h3>
              <div className="max-w-md">
                <VendorSelect
                  value={vendorId}
                  onChange={setVendorId}
                  label="Content Vendor"
                />
              </div>
            </div>

            <div className="glass-card rounded-xl p-6">
              <h3 className="mb-4 font-display text-lg font-semibold">
                Visibility & Access
              </h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Publish Status</Label>
                    <p className="text-sm text-muted-foreground">
                      Make this movie visible to users
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Subscription Required</Label>
                    <p className="text-sm text-muted-foreground">
                      Only premium subscribers can watch
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Enable Ads</Label>
                    <p className="text-sm text-muted-foreground">
                      Show ads before/during playback
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Allow Downloads</Label>
                    <p className="text-sm text-muted-foreground">
                      Users can download for offline viewing
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Featured Movie</Label>
                    <p className="text-sm text-muted-foreground">
                      Show in featured/trending section
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>

            <div className="glass-card rounded-xl p-6">
              <h3 className="mb-4 font-display text-lg font-semibold">
                Audio & Subtitles
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Available Audio Tracks</Label>
                  <Select
                    onValueChange={(value) => {
                      if (!audioTracks.includes(value)) {
                        setAudioTracks([...audioTracks, value]);
                      }
                    }}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Add audio language" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {languages.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {audioTracks.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {audioTracks.map((track, index) => (
                        <Badge key={index} variant="secondary" className="gap-1">
                          🔊 {track}
                          <button
                            onClick={() =>
                              setAudioTracks(audioTracks.filter((_, i) => i !== index))
                            }
                            className="ml-1"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Subtitle Languages</Label>
                  <Select
                    onValueChange={(value) => {
                      if (!subtitleLanguages.includes(value)) {
                        setSubtitleLanguages([...subtitleLanguages, value]);
                      }
                    }}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Add subtitle language" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {languages.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {subtitleLanguages.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {subtitleLanguages.map((lang, index) => (
                        <Badge key={index} variant="secondary" className="gap-1">
                          CC {lang}
                          <button
                            onClick={() =>
                              setSubtitleLanguages(
                                subtitleLanguages.filter((_, i) => i !== index)
                              )
                            }
                            className="ml-1"
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

            <div className="glass-card rounded-xl p-6 lg:col-span-2">
              <h3 className="mb-4 font-display text-lg font-semibold">
                Scheduling
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Publish Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-11 w-full justify-start text-left font-normal"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Schedule publish date
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-popover" align="start">
                      <CalendarComponent
                        mode="single"
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Expiry Date (Optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-11 w-full justify-start text-left font-normal"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Set expiry date
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-popover" align="start">
                      <CalendarComponent
                        mode="single"
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-6">
          <div className="glass-card rounded-xl p-6">
            <h3 className="mb-4 font-display text-lg font-semibold">
              Search Engine Optimization
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  placeholder="SEO optimized title (max 60 characters)"
                  maxLength={60}
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">0/60 characters</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  placeholder="SEO optimized description (max 160 characters)"
                  maxLength={160}
                  className="min-h-[100px] resize-none"
                />
                <p className="text-xs text-muted-foreground">0/160 characters</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    /movies/
                  </span>
                  <Input
                    id="slug"
                    placeholder="movie-url-slug"
                    className="h-11"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="canonical">Canonical URL (Optional)</Label>
                <Input
                  id="canonical"
                  placeholder="https://example.com/movies/..."
                  className="h-11"
                />
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6">
            <h3 className="mb-4 font-display text-lg font-semibold">
              Social Media Preview
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ogTitle">Open Graph Title</Label>
                <Input
                  id="ogTitle"
                  placeholder="Title for social sharing"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ogDescription">Open Graph Description</Label>
                <Textarea
                  id="ogDescription"
                  placeholder="Description for social sharing"
                  className="min-h-[80px] resize-none"
                />
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  PREVIEW
                </p>
                <div className="rounded-lg bg-secondary/50 p-4">
                  <div className="mb-2 aspect-video rounded bg-muted"></div>
                  <p className="font-semibold">Movie Title</p>
                  <p className="text-sm text-muted-foreground">
                    Movie description will appear here...
                  </p>
                  <p className="text-xs text-primary">yoursite.com</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Bottom Action Bar */}
      <div className="sticky bottom-0 mt-6 flex items-center justify-between rounded-xl border border-border bg-background/95 p-4 backdrop-blur-xl">
        <Button variant="ghost" onClick={() => navigate("/movies")}>
          Cancel
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Save className="h-4 w-4" />
            Save as Draft
          </Button>
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            Publish Movie
          </Button>
        </div>
      </div>
    </div>
  );
}
