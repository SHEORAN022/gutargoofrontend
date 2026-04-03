import { useState, useRef } from "react";
import {
  Plus,
  Search,
  User,
  Camera,
  X,
  Edit2,
  Trash2,
  Film,
  Clapperboard,
  Music,
  Pen,
  Video,
  Upload,
  Link,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useCastCrew } from "@/hooks/useCastCrew";
import { Person, PersonRole, roleLabels } from "@/lib/castCrewStore";
import { toast } from "sonner";

const roleIcons: Record<PersonRole, React.ElementType> = {
  actor: User,
  director: Clapperboard,
  producer: Film,
  writer: Pen,
  music_director: Music,
  cinematographer: Camera,
  editor: Video,
};

const roleColors: Record<PersonRole, string> = {
  actor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  director: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  producer: "bg-green-500/10 text-green-500 border-green-500/20",
  writer: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  music_director: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  cinematographer: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  editor: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
};

export default function CastCrew() {
  const { people, addPerson, updatePerson, deletePerson } = useCastCrew();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<PersonRole | "all">("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageInputType, setImageInputType] = useState<"upload" | "url">("upload");

  // Form state
  const [formName, setFormName] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formBio, setFormBio] = useState("");
  const [formRoles, setFormRoles] = useState<PersonRole[]>([]);

  const filteredPeople = people.filter((person) => {
    const matchesSearch = person.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = activeTab === "all" || person.roles.includes(activeTab as PersonRole);
    return matchesSearch && matchesRole;
  });

  const resetForm = () => {
    setFormName("");
    setFormImage("");
    setFormBio("");
    setFormRoles([]);
    setImageInputType("upload");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const openAddDialog = () => {
    resetForm();
    setEditingPerson(null);
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (person: Person) => {
    setFormName(person.name);
    setFormImage(person.image || "");
    setFormBio(person.bio || "");
    setFormRoles([...person.roles]);
    setEditingPerson(person);
    setIsAddDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formName.trim()) {
      toast.error("Please enter a name");
      return;
    }
    if (formRoles.length === 0) {
      toast.error("Please select at least one role");
      return;
    }

    if (editingPerson) {
      updatePerson(editingPerson.id, {
        name: formName.trim(),
        image: formImage.trim() || undefined,
        bio: formBio.trim() || undefined,
        roles: formRoles,
      });
      toast.success("Person updated successfully");
    } else {
      addPerson({
        name: formName.trim(),
        image: formImage.trim() || undefined,
        bio: formBio.trim() || undefined,
        roles: formRoles,
      });
      toast.success("Person added successfully");
    }

    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleDelete = () => {
    if (deleteConfirmId) {
      deletePerson(deleteConfirmId);
      toast.success("Person deleted successfully");
      setDeleteConfirmId(null);
    }
  };

  const toggleRole = (role: PersonRole) => {
    if (formRoles.includes(role)) {
      setFormRoles(formRoles.filter((r) => r !== role));
    } else {
      setFormRoles([...formRoles, role]);
    }
  };

  const stats = {
    total: people.length,
    actors: people.filter((p) => p.roles.includes("actor")).length,
    directors: people.filter((p) => p.roles.includes("director")).length,
    crew: people.filter((p) => 
      p.roles.some((r) => ["producer", "writer", "music_director", "cinematographer", "editor"].includes(r))
    ).length,
  };

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Cast & Crew</h1>
          <p className="text-sm text-muted-foreground">
            Manage all actors, directors, and crew members
          </p>
        </div>
        <Button onClick={openAddDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Person
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total People", value: stats.total, color: "text-primary" },
          { label: "Actors", value: stats.actors, color: "text-blue-500" },
          { label: "Directors", value: stats.directors, color: "text-purple-500" },
          { label: "Crew Members", value: stats.crew, color: "text-green-500" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-xl p-4">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="mb-6 glass-card rounded-xl p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 pl-10"
            />
          </div>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as PersonRole | "all")}>
            <TabsList className="bg-secondary/50">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="actor">Actors</TabsTrigger>
              <TabsTrigger value="director">Directors</TabsTrigger>
              <TabsTrigger value="producer">Producers</TabsTrigger>
              <TabsTrigger value="writer">Writers</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* People Grid */}
      {filteredPeople.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPeople.map((person) => (
            <div
              key={person.id}
              className="glass-card group rounded-xl p-4 transition-all hover:shadow-lg"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {person.image ? (
                    <img
                      src={person.image}
                      alt={person.name}
                      className="h-14 w-14 rounded-full object-cover ring-2 ring-border"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-muted-foreground ring-2 ring-border">
                      <User className="h-6 w-6" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">{person.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      Added {person.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEditDialog(person)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => setDeleteConfirmId(person.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {person.roles.map((role) => {
                  const Icon = roleIcons[role];
                  return (
                    <Badge
                      key={role}
                      variant="outline"
                      className={cn("gap-1 text-xs", roleColors[role])}
                    >
                      <Icon className="h-3 w-3" />
                      {roleLabels[role]}
                    </Badge>
                  );
                })}
              </div>

              {person.bio && (
                <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                  {person.bio}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-xl py-16 text-center">
          <User className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No people found</h3>
          <p className="mb-4 text-muted-foreground">
            {searchQuery
              ? "Try adjusting your search query"
              : "Start by adding your first cast or crew member"}
          </p>
          {!searchQuery && (
            <Button onClick={openAddDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Person
            </Button>
          )}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPerson ? "Edit Person" : "Add New Person"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {/* Image Preview & Upload - Compact */}
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                {formImage ? (
                  <img
                    src={formImage}
                    alt="Preview"
                    className="h-16 w-16 rounded-full object-cover ring-2 ring-border"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary ring-2 ring-border">
                    <User className="h-7 w-7 text-muted-foreground" />
                  </div>
                )}
                {formImage && (
                  <button
                    onClick={() => setFormImage("")}
                    className="absolute -right-1 -top-1 rounded-full bg-destructive p-0.5 text-destructive-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Image Input Toggle & Upload */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-1 rounded-md bg-secondary/50 p-0.5">
                  <button
                    type="button"
                    onClick={() => setImageInputType("upload")}
                    className={cn(
                      "flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-all",
                      imageInputType === "upload"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Upload className="h-3 w-3" />
                    Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageInputType("url")}
                    className={cn(
                      "flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-all",
                      imageInputType === "url"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Link className="h-3 w-3" />
                    URL
                  </button>
                </div>
                {imageInputType === "upload" ? (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full gap-1.5 text-xs"
                    >
                      <Upload className="h-3 w-3" />
                      Choose Image
                    </Button>
                  </>
                ) : (
                  <Input
                    placeholder="https://example.com/photo.jpg"
                    value={formImage.startsWith("data:") ? "" : formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    className="h-8 text-xs"
                  />
                )}
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1">
              <Label htmlFor="personName" className="text-xs">Name *</Label>
              <Input
                id="personName"
                placeholder="Full name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="h-9"
              />
            </div>

            {/* Roles - Compact Grid */}
            <div className="space-y-1">
              <Label className="text-xs">Roles *</Label>
              <div className="grid grid-cols-2 gap-1.5">
                {(Object.keys(roleLabels) as PersonRole[]).map((role) => {
                  const Icon = roleIcons[role];
                  const isChecked = formRoles.includes(role);
                  return (
                    <label
                      key={role}
                      className={cn(
                        "flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1.5 transition-all",
                        isChecked
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-secondary/50"
                      )}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleRole(role)}
                        className="h-3.5 w-3.5"
                      />
                      <Icon className="h-3 w-3" />
                      <span className="text-xs">{roleLabels[role]}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-1">
              <Label htmlFor="personBio" className="text-xs">Bio (Optional)</Label>
              <Textarea
                id="personBio"
                placeholder="Short biography..."
                value={formBio}
                onChange={(e) => setFormBio(e.target.value)}
                className="min-h-[60px] text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingPerson ? "Save Changes" : "Add Person"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Person?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this person from your database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
