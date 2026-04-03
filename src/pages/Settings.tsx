import { useState } from "react";
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Palette,
  Globe,
  Save,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export default function Settings() {
  const [saving, setSaving] = useState(false);
  const { updatePassword, user } = useAuth();

  // Password Change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // General Settings
  const [appName, setAppName] = useState("GUTARGOO+");
  const [appTagline, setAppTagline] = useState("Stream Unlimited Entertainment");
  const [supportEmail, setSupportEmail] = useState("support@gutargoo.com");
  const [defaultLanguage, setDefaultLanguage] = useState("hi");
  const [timezone, setTimezone] = useState("Asia/Kolkata");

  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [newUserAlerts, setNewUserAlerts] = useState(true);
  const [subscriptionAlerts, setSubscriptionAlerts] = useState(true);
  const [contentAlerts, setContentAlerts] = useState(false);

  // Security Settings
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [ipWhitelist, setIpWhitelist] = useState("");

  // Appearance Settings
  const [theme, setTheme] = useState("dark");
  const [accentColor, setAccentColor] = useState("orange");
  const [compactMode, setCompactMode] = useState(true);

  const handleSave = async () => {
    setSaving(true);
    // Simulate save
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    toast.success("Settings saved successfully");
  };

  const handleChangePassword = async () => {
    if (!newPassword.trim() || newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setChangingPassword(true);
    try {
      await updatePassword(newPassword);
      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Password change error:", error);
      toast.error(error.message || "Failed to update password");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight">Settings</h1>
          <p className="text-xs text-muted-foreground">Manage app configuration</p>
        </div>
        <Button size="sm" className="gap-1.5 h-8" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Save Changes
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 h-9">
          <TabsTrigger value="general" className="gap-1.5 text-xs">
            <SettingsIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5 text-xs">
            <Bell className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5 text-xs">
            <Shield className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-1.5 text-xs">
            <Palette className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <div className="glass-card rounded-lg p-4 space-y-4">
            <h3 className="font-medium text-sm flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              App Configuration
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="appName" className="text-xs">App Name</Label>
                <Input
                  id="appName"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="supportEmail" className="text-xs">Support Email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="tagline" className="text-xs">App Tagline</Label>
                <Input
                  id="tagline"
                  value={appTagline}
                  onChange={(e) => setAppTagline(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Default Language</Label>
                <Select value={defaultLanguage} onValueChange={setDefaultLanguage}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
                    <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
                    <SelectItem value="ml">മലയാളം (Malayalam)</SelectItem>
                    <SelectItem value="kn">ಕನ್ನಡ (Kannada)</SelectItem>
                    <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
                    <SelectItem value="mr">मराठी (Marathi)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="Asia/Kolkata">IST (Asia/Kolkata)</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="Asia/Dubai">GST (Asia/Dubai)</SelectItem>
                    <SelectItem value="America/New_York">EST (America/New_York)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <div className="glass-card rounded-lg p-4 space-y-4">
            <h3 className="font-medium text-sm flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              Notification Preferences
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-1.5 border-b border-border">
                <div>
                  <p className="text-sm font-medium">Email Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive emails for important updates</p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border">
                <div>
                  <p className="text-sm font-medium">Push Notifications</p>
                  <p className="text-xs text-muted-foreground">Browser push notifications</p>
                </div>
                <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border">
                <div>
                  <p className="text-sm font-medium">New User Alerts</p>
                  <p className="text-xs text-muted-foreground">Get notified when new users sign up</p>
                </div>
                <Switch checked={newUserAlerts} onCheckedChange={setNewUserAlerts} />
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border">
                <div>
                  <p className="text-sm font-medium">Subscription Alerts</p>
                  <p className="text-xs text-muted-foreground">New subscriptions & cancellations</p>
                </div>
                <Switch checked={subscriptionAlerts} onCheckedChange={setSubscriptionAlerts} />
              </div>
              <div className="flex items-center justify-between py-1.5">
                <div>
                  <p className="text-sm font-medium">Content Upload Alerts</p>
                  <p className="text-xs text-muted-foreground">When vendors upload new content</p>
                </div>
                <Switch checked={contentAlerts} onCheckedChange={setContentAlerts} />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          {/* Change Password Section */}
          <div className="glass-card rounded-lg p-4 space-y-4">
            <h3 className="font-medium text-sm flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              Change Password
            </h3>
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground mb-2">
                Logged in as: <span className="font-medium text-foreground">{user?.email}</span>
              </div>
              <div className="space-y-1">
                <Label htmlFor="newPassword" className="text-xs">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="h-8 text-sm pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                    onClick={() => setShowPasswords(!showPasswords)}
                  >
                    {showPasswords ? (
                      <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirmPassword" className="text-xs">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="h-8 text-sm"
                  />
                  {confirmPassword && newPassword === confirmPassword && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Password must be at least 8 characters long
              </p>
              <Button
                size="sm"
                className="h-8 gap-1.5"
                onClick={handleChangePassword}
                disabled={changingPassword || !newPassword || !confirmPassword}
              >
                {changingPassword ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5" />
                    Update Password
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Security Configuration */}
          <div className="glass-card rounded-lg p-4 space-y-4">
            <h3 className="font-medium text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Security Configuration
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-1.5 border-b border-border">
                <div>
                  <p className="text-sm font-medium">Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground">Require 2FA for admin login</p>
                </div>
                <Switch checked={twoFactorAuth} onCheckedChange={setTwoFactorAuth} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                <div className="space-y-1">
                  <Label className="text-xs">Session Timeout (minutes)</Label>
                  <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                      <SelectItem value="480">8 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1 pt-2">
                <Label htmlFor="ipWhitelist" className="text-xs">IP Whitelist (one per line)</Label>
                <Textarea
                  id="ipWhitelist"
                  value={ipWhitelist}
                  onChange={(e) => setIpWhitelist(e.target.value)}
                  placeholder="192.168.1.1&#10;10.0.0.1"
                  className="h-20 text-sm resize-none"
                />
                <p className="text-[10px] text-muted-foreground">Leave empty to allow all IPs</p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-4">
          <div className="glass-card rounded-lg p-4 space-y-4">
            <h3 className="font-medium text-sm flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" />
              Appearance Preferences
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Accent Color</Label>
                <Select value={accentColor} onValueChange={setAccentColor}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="orange">Orange (Default)</SelectItem>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between py-1.5 border-t border-border pt-3">
              <div>
                <p className="text-sm font-medium">Compact Mode</p>
                <p className="text-xs text-muted-foreground">Reduce spacing for denser UI</p>
              </div>
              <Switch checked={compactMode} onCheckedChange={setCompactMode} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
