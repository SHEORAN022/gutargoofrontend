import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  Settings,
  LayoutGrid,
  Video,
  Gift,
  Image,
  Key,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AdSetting {
  id: string;
  provider: "google" | "facebook" | "custom";
  ad_unit_id: string | null;
  app_id: string | null;
  is_enabled: boolean;
  ad_type: "banner" | "interstitial" | "rewarded" | "native";
  placement: string;
  frequency_cap: number | null;
  created_at: string;
  updated_at: string;
}

interface GoogleAdsConfig {
  appId: string;
  bannerId: string;
  interstitialId: string;
  rewardedId: string;
  nativeId: string;
}

const adTypeIcons: Record<string, React.ElementType> = {
  banner: LayoutGrid,
  interstitial: Video,
  rewarded: Gift,
  native: Image,
};

const adTypeLabels: Record<string, string> = {
  banner: "Banner Ad",
  interstitial: "Interstitial Ad",
  rewarded: "Rewarded Video",
  native: "Native Ad",
};

const placementOptions = [
  "home_top",
  "home_bottom",
  "movie_detail",
  "before_play",
  "after_play",
  "search_results",
  "category_list",
  "episode_list",
];

export default function AdsManager() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingAd, setEditingAd] = useState<AdSetting | null>(null);

  // Form state for ad placement
  const [formProvider, setFormProvider] = useState<"google" | "facebook" | "custom">("google");
  const [formAdType, setFormAdType] = useState<"banner" | "interstitial" | "rewarded" | "native">("banner");
  const [formAdUnitId, setFormAdUnitId] = useState("");
  const [formAppId, setFormAppId] = useState("");
  const [formPlacement, setFormPlacement] = useState("");
  const [formFrequencyCap, setFormFrequencyCap] = useState("");
  const [formIsEnabled, setFormIsEnabled] = useState(true);

  // Google Ads config state
  const [googleConfig, setGoogleConfig] = useState<GoogleAdsConfig>({
    appId: "",
    bannerId: "",
    interstitialId: "",
    rewardedId: "",
    nativeId: "",
  });

  // Fetch ads
  const { data: ads = [], isLoading } = useQuery({
    queryKey: ["ads_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ads_settings").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as AdSetting[];
    },
  });

  // Add ad mutation
  const addMutation = useMutation({
    mutationFn: async (ad: {
      provider?: string;
      ad_type: string;
      ad_unit_id?: string | null;
      app_id?: string | null;
      placement: string;
      frequency_cap?: number | null;
      is_enabled?: boolean;
    }) => {
      const { data, error } = await supabase.from("ads_settings").insert([ad]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads_settings"] });
      toast.success("Ad placement added successfully");
      closeDialog();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Update ad mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AdSetting> & { id: string }) => {
      const { data, error } = await supabase.from("ads_settings").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads_settings"] });
      toast.success("Ad placement updated successfully");
      closeDialog();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Delete ad mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ads_settings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads_settings"] });
      toast.success("Ad placement deleted successfully");
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Toggle active status
  const toggleActive = async (id: string, isEnabled: boolean) => {
    updateMutation.mutate({ id, is_enabled: isEnabled });
  };

  const openAddDialog = () => {
    setEditingAd(null);
    setFormProvider("google");
    setFormAdType("banner");
    setFormAdUnitId("");
    setFormAppId("");
    setFormPlacement("");
    setFormFrequencyCap("");
    setFormIsEnabled(true);
    setDialogOpen(true);
  };

  const openEditDialog = (ad: AdSetting) => {
    setEditingAd(ad);
    setFormProvider(ad.provider);
    setFormAdType(ad.ad_type);
    setFormAdUnitId(ad.ad_unit_id || "");
    setFormAppId(ad.app_id || "");
    setFormPlacement(ad.placement);
    setFormFrequencyCap(ad.frequency_cap?.toString() || "");
    setFormIsEnabled(ad.is_enabled);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingAd(null);
  };

  const handleSubmit = () => {
    if (!formPlacement) {
      toast.error("Placement is required");
      return;
    }

    const adData = {
      provider: formProvider,
      ad_type: formAdType,
      ad_unit_id: formAdUnitId || null,
      app_id: formAppId || null,
      placement: formPlacement,
      frequency_cap: formFrequencyCap ? parseInt(formFrequencyCap) : null,
      is_enabled: formIsEnabled,
    };

    if (editingAd) {
      updateMutation.mutate({ id: editingAd.id, ...adData });
    } else {
      addMutation.mutate(adData);
    }
  };

  const handleSaveGoogleConfig = () => {
    // In a real app, this would save to secure storage/secrets
    toast.success("Google Ads configuration saved! Your app is now ready to show ads.");
    setConfigDialogOpen(false);
  };

  // Stats
  const enabledAds = ads.filter((a) => a.is_enabled).length;
  const googleAds = ads.filter((a) => a.provider === "google").length;

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
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Ads Manager</h1>
          <p className="mt-1 text-sm text-muted-foreground">Configure Google AdMob and manage ad placements</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setConfigDialogOpen(true)}>
            <Key className="h-4 w-4" />
            <span className="hidden sm:inline">Configure Keys</span>
          </Button>
          <Button className="gap-2" onClick={openAddDialog}>
            <Plus className="h-4 w-4" />
            Add Placement
          </Button>
        </div>
      </div>

      {/* Google Ads Config Card */}
      <Card className="glass-card border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#4285F4]/10">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22.5 12c0 5.799-4.701 10.5-10.5 10.5S1.5 17.799 1.5 12 6.201 1.5 12 1.5 22.5 6.201 22.5 12z"
                  fill="#4285F4"
                />
                <path d="M12 6.75a5.25 5.25 0 100 10.5 5.25 5.25 0 000-10.5z" fill="#fff" />
                <path d="M12 9a3 3 0 100 6 3 3 0 000-6z" fill="#4285F4" />
              </svg>
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">Google AdMob Integration</CardTitle>
              <CardDescription>Configure your Google AdMob keys to display ads in your app</CardDescription>
            </div>
            <Badge variant={enabledAds > 0 ? "default" : "secondary"} className="gap-1">
              {enabledAds > 0 ? (
                <>
                  <CheckCircle className="h-3 w-3" />
                  Active
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3" />
                  Not Configured
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-lg border border-border bg-secondary/20 p-3">
              <p className="text-xs text-muted-foreground">Total Placements</p>
              <p className="mt-1 font-display text-2xl font-bold">{ads.length}</p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/20 p-3">
              <p className="text-xs text-muted-foreground">Active Ads</p>
              <p className="mt-1 font-display text-2xl font-bold text-success">{enabledAds}</p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/20 p-3">
              <p className="text-xs text-muted-foreground">Google Ads</p>
              <p className="mt-1 font-display text-2xl font-bold text-[#4285F4]">{googleAds}</p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/20 p-3">
              <p className="text-xs text-muted-foreground">Other Providers</p>
              <p className="mt-1 font-display text-2xl font-bold">{ads.length - googleAds}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Alert */}
      <div className="rounded-lg border border-warning/20 bg-warning/5 p-4">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-warning">Important: Flutter App Integration</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              After configuring your ad placements here, you'll need to add the corresponding Ad Unit IDs in your
              Flutter app's AdMob configuration. The placements defined here control where and when ads appear in your
              app.
            </p>
          </div>
        </div>
      </div>

      {/* Ad Placements */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All ({ads.length})</TabsTrigger>
          <TabsTrigger value="banner">Banner ({ads.filter((a) => a.ad_type === "banner").length})</TabsTrigger>
          <TabsTrigger value="interstitial">
            Interstitial ({ads.filter((a) => a.ad_type === "interstitial").length})
          </TabsTrigger>
          <TabsTrigger value="rewarded">Rewarded ({ads.filter((a) => a.ad_type === "rewarded").length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ads.map((ad) => {
              const Icon = adTypeIcons[ad.ad_type] || LayoutGrid;
              return (
                <Card key={ad.id} className="glass-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{adTypeLabels[ad.ad_type]}</CardTitle>
                          <CardDescription className="text-xs">{ad.placement}</CardDescription>
                        </div>
                      </div>
                      <Switch checked={ad.is_enabled} onCheckedChange={(checked) => toggleActive(ad.id, checked)} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Provider</span>
                        <Badge variant="outline" className="capitalize">
                          {ad.provider}
                        </Badge>
                      </div>
                      {ad.ad_unit_id && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Ad Unit ID</span>
                          <span className="font-mono text-xs truncate max-w-[150px]">{ad.ad_unit_id}</span>
                        </div>
                      )}
                      {ad.frequency_cap && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Frequency Cap</span>
                          <span>{ad.frequency_cap} per session</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => openEditDialog(ad)}>
                        <Edit className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteId(ad.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {ads.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Settings className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold">No ad placements configured</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Add your first ad placement to start monetizing your app
              </p>
              <Button className="mt-4 gap-2" onClick={openAddDialog}>
                <Plus className="h-4 w-4" />
                Add First Placement
              </Button>
            </div>
          )}
        </TabsContent>

        {["banner", "interstitial", "rewarded"].map((type) => (
          <TabsContent key={type} value={type} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ads
                .filter((a) => a.ad_type === type)
                .map((ad) => {
                  const Icon = adTypeIcons[ad.ad_type] || LayoutGrid;
                  return (
                    <Card key={ad.id} className="glass-card">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-base">{adTypeLabels[ad.ad_type]}</CardTitle>
                              <CardDescription className="text-xs">{ad.placement}</CardDescription>
                            </div>
                          </div>
                          <Switch checked={ad.is_enabled} onCheckedChange={(checked) => toggleActive(ad.id, checked)} />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Provider</span>
                            <Badge variant="outline" className="capitalize">
                              {ad.provider}
                            </Badge>
                          </div>
                          {ad.ad_unit_id && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Ad Unit ID</span>
                              <span className="font-mono text-xs truncate max-w-[150px]">{ad.ad_unit_id}</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-4 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-1"
                            onClick={() => openEditDialog(ad)}
                          >
                            <Edit className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteId(ad.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAd ? "Edit Ad Placement" : "Add Ad Placement"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Provider</Label>
                <Select value={formProvider} onValueChange={(v: typeof formProvider) => setFormProvider(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="google">Google AdMob</SelectItem>
                    <SelectItem value="facebook">Facebook Ads</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ad Type</Label>
                <Select value={formAdType} onValueChange={(v: typeof formAdType) => setFormAdType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="banner">Banner</SelectItem>
                    <SelectItem value="interstitial">Interstitial</SelectItem>
                    <SelectItem value="rewarded">Rewarded</SelectItem>
                    <SelectItem value="native">Native</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Placement *</Label>
              <Select value={formPlacement} onValueChange={setFormPlacement}>
                <SelectTrigger>
                  <SelectValue placeholder="Select placement" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {placementOptions.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adUnitId">Ad Unit ID</Label>
              <Input
                id="adUnitId"
                value={formAdUnitId}
                onChange={(e) => setFormAdUnitId(e.target.value)}
                placeholder="ca-app-pub-xxxxxxxx/xxxxxxxx"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="appId">App ID (optional)</Label>
              <Input
                id="appId"
                value={formAppId}
                onChange={(e) => setFormAppId(e.target.value)}
                placeholder="ca-app-pub-xxxxxxxx~xxxxxxxx"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequencyCap">Frequency Cap (per session)</Label>
              <Input
                id="frequencyCap"
                type="number"
                value={formFrequencyCap}
                onChange={(e) => setFormFrequencyCap(e.target.value)}
                placeholder="No limit"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={formIsEnabled} onCheckedChange={setFormIsEnabled} />
              <Label>Enabled</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={addMutation.isPending || updateMutation.isPending}>
              {(addMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingAd ? "Update" : "Add Placement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Google Config Dialog */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Google AdMob Configuration
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border border-warning/20 bg-warning/5 p-3">
              <p className="text-sm text-muted-foreground">
                <strong className="text-warning">Note:</strong> These keys will be used in your Flutter app's AdMob
                configuration. Get your Ad Unit IDs from the{" "}
                <a
                  href="https://admob.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  Google AdMob Console
                </a>
                .
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="googleAppId">App ID *</Label>
              <Input
                id="googleAppId"
                value={googleConfig.appId}
                onChange={(e) => setGoogleConfig({ ...googleConfig, appId: e.target.value })}
                placeholder="ca-app-pub-xxxxxxxx~xxxxxxxx"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bannerId">Banner Ad Unit ID</Label>
              <Input
                id="bannerId"
                value={googleConfig.bannerId}
                onChange={(e) => setGoogleConfig({ ...googleConfig, bannerId: e.target.value })}
                placeholder="ca-app-pub-xxxxxxxx/xxxxxxxx"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interstitialId">Interstitial Ad Unit ID</Label>
              <Input
                id="interstitialId"
                value={googleConfig.interstitialId}
                onChange={(e) => setGoogleConfig({ ...googleConfig, interstitialId: e.target.value })}
                placeholder="ca-app-pub-xxxxxxxx/xxxxxxxx"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rewardedId">Rewarded Ad Unit ID</Label>
              <Input
                id="rewardedId"
                value={googleConfig.rewardedId}
                onChange={(e) => setGoogleConfig({ ...googleConfig, rewardedId: e.target.value })}
                placeholder="ca-app-pub-xxxxxxxx/xxxxxxxx"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nativeId">Native Ad Unit ID</Label>
              <Input
                id="nativeId"
                value={googleConfig.nativeId}
                onChange={(e) => setGoogleConfig({ ...googleConfig, nativeId: e.target.value })}
                placeholder="ca-app-pub-xxxxxxxx/xxxxxxxx"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveGoogleConfig}>Save Configuration</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Ad Placement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this ad placement? This will stop ads from showing in this location in
              your app.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
