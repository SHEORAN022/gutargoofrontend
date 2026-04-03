import { Bell, Moon, Search, Sun, User, ChevronDown, Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AdminHeaderProps {
  onMenuClick?: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const [isDark, setIsDark] = useState(false);
  const isMobile = useIsMobile();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <header className="sticky top-0 z-30 flex h-14 md:h-16 items-center justify-between border-b border-border/50 bg-background/95 px-3 md:px-6 backdrop-blur-xl gap-2 md:gap-4">
      {/* Mobile Menu Button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 rounded-lg"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={isMobile ? "Search..." : "Search movies, series, users..."}
          className="h-9 md:h-10 w-full rounded-xl border-border/50 bg-secondary/50 pl-9 md:pl-10 text-sm transition-all focus-visible:border-primary/50 focus-visible:ring-primary/20"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 md:gap-1">
        {/* Theme Toggle */}
        {/* <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsDark(!isDark)}
          className="h-9 w-9 md:h-10 md:w-10 rounded-xl text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          {isDark ? <Sun className="h-4 w-4 md:h-[18px] md:w-[18px]" /> : <Moon className="h-4 w-4 md:h-[18px] md:w-[18px]" />}
        </Button> */}

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 md:h-10 md:w-10 rounded-xl text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Bell className="h-4 w-4 md:h-[18px] md:w-[18px]" />
          <span className="absolute right-1.5 md:right-2 top-1.5 md:top-2 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
          </span>
        </Button>

        {/* Divider - hidden on mobile */}
        <div className="hidden md:block mx-2 h-8 w-px bg-border/50" />

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="h-9 md:h-10 gap-2 md:gap-3 rounded-xl px-2 md:px-3 transition-colors hover:bg-secondary"
            >
              <div className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
                <User className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary-foreground" />
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-semibold leading-tight">
                  {user?.email?.split("@")[0] || "Admin"}
                </p>
                <p className="text-[10px] font-medium uppercase tracking-wide text-primary">
                  Super Admin
                </p>
              </div>
              <ChevronDown className="hidden lg:block h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">
                  {user?.email?.split("@")[0] || "Admin"}
                </p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* <DropdownMenuItem className="rounded-lg">Profile Settings</DropdownMenuItem> */}
            {/* <DropdownMenuItem className="rounded-lg">Preferences</DropdownMenuItem> */}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="rounded-lg text-destructive focus:text-destructive cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}