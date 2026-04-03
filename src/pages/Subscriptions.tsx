import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Edit,
  Trash2,
  Check,
  Crown,
  Sparkles,
  Zap,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: "monthly" | "yearly" | "lifetime";
  features: string[];
  max_devices: number;
  max_downloads: number | null;
  has_ads: boolean;
  quality: "SD" | "HD" | "4K" | "4K_HDR";
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const planIcons: Record<string, React.ElementType> = {
  Basic: Zap,
  Premium: Crown,
  Enterprise: Sparkles,
};

const qualityLabels: Record<string, string> = {
  SD: "SD",
  HD: "HD",
  "4K": "4K",
  "4K_HDR": "4K+HDR",
};

export default function Subscriptions() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formDuration, setFormDuration] = useState<"monthly" | "yearly" | "lifetime">("monthly");
  const [formFeatures, setFormFeatures] = useState<string[]>([]);
  const [formNewFeature, setFormNewFeature] = useState("");
  const [formMaxDevices, setFormMaxDevices] = useState("1");
  const [formMaxDownloads, setFormMaxDownloads] = useState("");
  const [formHasAds, setFormHasAds] = useState(true);
  const [formQuality, setFormQuality] = useState<"SD" | "HD" | "4K" | "4K_HDR">("HD");
  const [formIsActive, setFormIsActive] = useState(true);

  // Fetch plans
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["subscription_plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data.map((p) => ({
        ...p,
        features: Array.isArray(p.features) ? p.features : JSON.parse(p.features as string),
      })) as SubscriptionPlan[];
    },
  });

  // Add plan mutation
  const addMutation = useMutation({
    mutationFn: async (plan: { name: string; price: number; duration: string; features?: string[]; max_devices?: number; max_downloads?: number | null; has_ads?: boolean; quality?: string; is_active?: boolean; sort_order?: number }) => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .insert([plan])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription_plans"] });
      toast.success("Plan added successfully");
      closeDialog();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Update plan mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SubscriptionPlan> & { id: string }) => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription_plans"] });
      toast.success("Plan updated successfully");
      closeDialog();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Delete plan mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("subscription_plans").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription_plans"] });
      toast.success("Plan deleted successfully");
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
    setEditingPlan(null);
    setFormName("");
    setFormPrice("");
    setFormDuration("monthly");
    setFormFeatures([]);
    setFormMaxDevices("1");
    setFormMaxDownloads("");
    setFormHasAds(true);
    setFormQuality("HD");
    setFormIsActive(true);
    setDialogOpen(true);
  };

  const openEditDialog = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormName(plan.name);
    setFormPrice(plan.price.toString());
    setFormDuration(plan.duration);
    setFormFeatures(plan.features);
    setFormMaxDevices(plan.max_devices.toString());
    setFormMaxDownloads(plan.max_downloads?.toString() || "");
    setFormHasAds(plan.has_ads);
    setFormQuality(plan.quality);
    setFormIsActive(plan.is_active);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingPlan(null);
  };

  const addFeature = () => {
    if (formNewFeature.trim()) {
      setFormFeatures([...formFeatures, formNewFeature.trim()]);
      setFormNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFormFeatures(formFeatures.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!formName.trim()) {
      toast.error("Plan name is required");
      return;
    }
    if (!formPrice || isNaN(parseFloat(formPrice))) {
      toast.error("Valid price is required");
      return;
    }

    const planData = {
      name: formName.trim(),
      price: parseFloat(formPrice),
      duration: formDuration,
      features: formFeatures,
      max_devices: parseInt(formMaxDevices) || 1,
      max_downloads: formMaxDownloads ? parseInt(formMaxDownloads) : null,
      has_ads: formHasAds,
      quality: formQuality,
      is_active: formIsActive,
    };

    if (editingPlan) {
      updateMutation.mutate({ id: editingPlan.id, ...planData });
    } else {
      addMutation.mutate({ ...planData, sort_order: plans.length + 1 });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight">Subscriptions</h1>
          <p className="text-xs text-muted-foreground">Manage plans & pricing</p>
        </div>
        <Button size="sm" className="gap-1.5 h-8" onClick={openAddDialog}>
          <Plus className="h-3.5 w-3.5" />
          Create Plan
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Active</p>
          <p className="font-display text-xl font-bold">{plans.filter((p) => p.is_active).length}</p>
        </div>
        <div className="glass-card rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Price Range</p>
          <p className="font-display text-xl font-bold">
            ₹{Math.min(...plans.map((p) => p.price))}-₹{Math.max(...plans.map((p) => p.price))}
          </p>
        </div>
        <div className="glass-card rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Ad-Free</p>
          <p className="font-display text-xl font-bold">{plans.filter((p) => !p.has_ads).length}</p>
        </div>
      </div>

      {/* Plans Table */}
      <div className="glass-card overflow-hidden rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="px-3 py-2 text-left text-xs font-medium uppercase text-muted-foreground">Plan</th>
              <th className="px-3 py-2 text-left text-xs font-medium uppercase text-muted-foreground">Price</th>
              <th className="hidden sm:table-cell px-3 py-2 text-left text-xs font-medium uppercase text-muted-foreground">Quality</th>
              <th className="hidden md:table-cell px-3 py-2 text-left text-xs font-medium uppercase text-muted-foreground">Devices</th>
              <th className="hidden lg:table-cell px-3 py-2 text-left text-xs font-medium uppercase text-muted-foreground">Features</th>
              <th className="px-3 py-2 text-center text-xs font-medium uppercase text-muted-foreground">Active</th>
              <th className="px-3 py-2 text-right text-xs font-medium uppercase text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {plans.map((plan, index) => {
              const Icon = planIcons[plan.name] || Zap;
              return (
                <tr key={plan.id} className="transition-colors hover:bg-secondary/20">
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-sm">{plan.name}</span>
                          {index === 1 && (
                            <Badge className="h-4 px-1 text-[10px]">Popular</Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground capitalize">{plan.duration}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="font-display text-lg font-bold">₹{plan.price}</span>
                  </td>
                  <td className="hidden sm:table-cell px-3 py-2.5">
                    <Badge variant="outline" className="text-xs">{qualityLabels[plan.quality]}</Badge>
                  </td>
                  <td className="hidden md:table-cell px-3 py-2.5 text-sm">
                    {plan.max_devices} {plan.has_ads && <Badge variant="secondary" className="ml-1 text-[10px] px-1">Ads</Badge>}
                  </td>
                  <td className="hidden lg:table-cell px-3 py-2.5">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {plan.features.slice(0, 2).map((f, i) => (
                        <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">
                          {f.length > 15 ? f.slice(0, 15) + "..." : f}
                        </Badge>
                      ))}
                      {plan.features.length > 2 && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          +{plan.features.length - 2}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <Switch
                      checked={plan.is_active}
                      onCheckedChange={(checked) => toggleActive(plan.id, checked)}
                      className="scale-75"
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => openEditDialog(plan)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(plan.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg">
              {editingPlan ? "Edit Plan" : "Create Plan"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid gap-3 grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="name" className="text-xs">Plan Name *</Label>
                <Input
                  id="name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Premium"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="price" className="text-xs">Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  placeholder="199"
                  className="h-8 text-sm"
                />
              </div>
            </div>

            <div className="grid gap-3 grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Duration</Label>
                <Select value={formDuration} onValueChange={(v: typeof formDuration) => setFormDuration(v)}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="lifetime">Lifetime</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Quality</Label>
                <Select value={formQuality} onValueChange={(v: typeof formQuality) => setFormQuality(v)}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="SD">SD</SelectItem>
                    <SelectItem value="HD">HD</SelectItem>
                    <SelectItem value="4K">4K</SelectItem>
                    <SelectItem value="4K_HDR">4K + HDR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-3 grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="devices" className="text-xs">Max Devices</Label>
                <Input
                  id="devices"
                  type="number"
                  value={formMaxDevices}
                  onChange={(e) => setFormMaxDevices(e.target.value)}
                  placeholder="1"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="downloads" className="text-xs">Max Downloads</Label>
                <Input
                  id="downloads"
                  type="number"
                  value={formMaxDownloads}
                  onChange={(e) => setFormMaxDownloads(e.target.value)}
                  placeholder="∞"
                  className="h-8 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 py-1">
              <div className="flex items-center gap-1.5">
                <Switch checked={formHasAds} onCheckedChange={setFormHasAds} className="scale-75" />
                <Label className="text-xs">Show Ads</Label>
              </div>
              <div className="flex items-center gap-1.5">
                <Switch checked={formIsActive} onCheckedChange={setFormIsActive} className="scale-75" />
                <Label className="text-xs">Active</Label>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Features</Label>
              <div className="flex gap-1.5">
                <Input
                  value={formNewFeature}
                  onChange={(e) => setFormNewFeature(e.target.value)}
                  placeholder="Add feature..."
                  className="h-8 text-sm"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                />
                <Button type="button" variant="outline" size="sm" className="h-8 px-2" onClick={addFeature}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
              {formFeatures.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {formFeatures.map((feature, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-0.5 pr-0.5 text-xs">
                      {feature}
                      <button
                        onClick={() => removeFeature(idx)}
                        className="ml-0.5 rounded-full p-0.5 hover:bg-background/50"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button variant="outline" size="sm" onClick={closeDialog}>Cancel</Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={addMutation.isPending || updateMutation.isPending}
            >
              {(addMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              )}
              {editingPlan ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? Existing subscribers won't be affected until renewal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
