import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  FolderTree,
  LayoutGrid,
  List,
  GripVertical,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  parent_id: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const iconOptions = [
  "Swords", "Laugh", "Drama", "Ghost", "Heart", "Rocket", "AlertTriangle", 
  "Film", "Music", "Gamepad", "Baby", "Users", "Tv", "Star", "Trophy"
];

export default function Categories() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // Form state
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formIcon, setFormIcon] = useState("");
  const [formParentId, setFormParentId] = useState<string | null>(null);
  const [formIsActive, setFormIsActive] = useState(true);

  // Fetch categories
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as Category[];
    },
  });

  // Add category mutation
  const addMutation = useMutation({
    mutationFn: async (category: { name: string; slug: string; description?: string | null; icon?: string | null; parent_id?: string | null; is_active?: boolean; sort_order?: number }) => {
      const { data, error } = await supabase
        .from("categories")
        .insert([category])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category added successfully");
      closeDialog();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Update category mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Category> & { id: string }) => {
      const { data, error } = await supabase
        .from("categories")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category updated successfully");
      closeDialog();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category deleted successfully");
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Toggle active status
  const toggleActive = async (id: string, isActive: boolean) => {
    updateMutation.mutate({ id, is_active: isActive });
  };

  const openAddDialog = () => {
    setEditingCategory(null);
    setFormName("");
    setFormSlug("");
    setFormDescription("");
    setFormIcon("");
    setFormParentId(null);
    setFormIsActive(true);
    setDialogOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormName(category.name);
    setFormSlug(category.slug);
    setFormDescription(category.description || "");
    setFormIcon(category.icon || "");
    setFormParentId(category.parent_id);
    setFormIsActive(category.is_active);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
  };

  const handleSubmit = () => {
    if (!formName.trim()) {
      toast.error("Category name is required");
      return;
    }
    
    const slug = formSlug.trim() || formName.toLowerCase().replace(/\s+/g, "-");
    const categoryData = {
      name: formName.trim(),
      slug,
      description: formDescription.trim() || null,
      icon: formIcon || null,
      parent_id: formParentId,
      is_active: formIsActive,
    };

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, ...categoryData });
    } else {
      addMutation.mutate({ ...categoryData, sort_order: categories.length + 1 });
    }
  };

  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const parentCategories = categories.filter((cat) => !cat.parent_id);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
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
            Categories
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage content categories for your platform
          </p>
        </div>
        <Button className="gap-2" onClick={openAddDialog}>
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Filters */}
      <div className="glass-card flex flex-col gap-3 rounded-xl p-3 sm:p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
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

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Total Categories</p>
          <p className="mt-1 font-display text-2xl font-bold">{categories.length}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="mt-1 font-display text-2xl font-bold text-success">
            {categories.filter((c) => c.is_active).length}
          </p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Inactive</p>
          <p className="mt-1 font-display text-2xl font-bold text-muted-foreground">
            {categories.filter((c) => !c.is_active).length}
          </p>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="glass-card group rounded-xl p-4 transition-all hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <FolderTree className="h-6 w-6 text-primary" />
                </div>
                <Switch
                  checked={category.is_active}
                  onCheckedChange={(checked) => toggleActive(category.id, checked)}
                />
              </div>
              <div className="mt-4">
                <h3 className="font-semibold">{category.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {category.description || "No description"}
                </p>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Badge variant={category.is_active ? "default" : "secondary"}>
                  {category.is_active ? "Active" : "Inactive"}
                </Badge>
                {category.parent_id && (
                  <Badge variant="outline" className="text-xs">
                    Sub-category
                  </Badge>
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1"
                  onClick={() => openEditDialog(category)}
                >
                  <Edit className="h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  onClick={() => setDeleteId(category.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="glass-card overflow-hidden rounded-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Category
                  </th>
                  <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Slug
                  </th>
                  <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Parent
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="transition-colors hover:bg-secondary/20">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <FolderTree className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{category.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                            {category.description || "No description"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 text-sm text-muted-foreground">
                      {category.slug}
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3 text-sm">
                      {category.parent_id
                        ? categories.find((c) => c.id === category.parent_id)?.name || "-"
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <Switch
                        checked={category.is_active}
                        onCheckedChange={(checked) => toggleActive(category.id, checked)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditDialog(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add New Category"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g., Action Movies"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
                placeholder="auto-generated from name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Brief description of this category"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <Select value={formIcon} onValueChange={setFormIcon}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an icon" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {iconOptions.map((icon) => (
                    <SelectItem key={icon} value={icon}>
                      {icon}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Parent Category</Label>
              <Select
                value={formParentId || "none"}
                onValueChange={(v) => setFormParentId(v === "none" ? null : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="None (Top Level)" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="none">None (Top Level)</SelectItem>
                  {parentCategories
                    .filter((c) => c.id !== editingCategory?.id)
                    .map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formIsActive} onCheckedChange={setFormIsActive} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={addMutation.isPending || updateMutation.isPending}
            >
              {(addMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editingCategory ? "Update" : "Add Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
              Sub-categories will become top-level categories.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
