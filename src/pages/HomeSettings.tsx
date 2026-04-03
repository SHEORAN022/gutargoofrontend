import { useHomeSettings } from "@/hooks/useHomeSettings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Image, Tv, Film, Video, Clock, TrendingUp } from "lucide-react";

export default function HomeSettings() {
  const { settings, isLoading, getSettingValue, updateSetting } = useHomeSettings();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Home Settings</h1>
          <p className="text-sm text-muted-foreground">Configure global home screen settings</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Home Settings</h1>
        <p className="text-sm text-muted-foreground">Configure global home screen settings for your OTT app</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Banner Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Image className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Banner Settings</CardTitle>
            </div>
            <CardDescription>Configure hero banner behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Maximum Banners to Display</Label>
              <Input
                type="number"
                min={1}
                max={20}
                value={getSettingValue("banner_limit", 8)}
                onChange={(e) => updateSetting.mutate({ key: "banner_limit", value: parseInt(e.target.value) || 8 })}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">Recommended: 5-8 banners for optimal performance</p>
            </div>
          </CardContent>
        </Card>

        {/* Continue Watching */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Continue Watching</CardTitle>
            </div>
            <CardDescription>User watch progress tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Continue Watching Section</Label>
                <p className="text-xs text-muted-foreground">Show users their in-progress content</p>
              </div>
              <Switch
                checked={getSettingValue("continue_watching_enabled", true)}
                onCheckedChange={(v) => updateSetting.mutate({ key: "continue_watching_enabled", value: v })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Trending Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Trending Settings</CardTitle>
            </div>
            <CardDescription>Configure trending content logic</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-calculate Trending</Label>
                <p className="text-xs text-muted-foreground">Based on views and watch time</p>
              </div>
              <Switch
                checked={getSettingValue("trending_auto_mode", true)}
                onCheckedChange={(v) => updateSetting.mutate({ key: "trending_auto_mode", value: v })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Originals Tab Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Tv className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Originals Tab</CardTitle>
            </div>
            <CardDescription>Configure what appears in Originals tab</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Film className="h-4 w-4 text-muted-foreground" />
                <Label>Show Original Movies</Label>
              </div>
              <Switch
                checked={getSettingValue("originals_show_movies", true)}
                onCheckedChange={(v) => updateSetting.mutate({ key: "originals_show_movies", value: v })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-muted-foreground" />
                <Label>Show Original Web Series</Label>
              </div>
              <Switch
                checked={getSettingValue("originals_show_web_series", true)}
                onCheckedChange={(v) => updateSetting.mutate({ key: "originals_show_web_series", value: v })}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Note:</strong> Changes to these settings are applied immediately. 
            The Flutter app will fetch the updated configuration on next launch or refresh.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
